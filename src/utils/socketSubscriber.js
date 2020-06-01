import React from "react"
import sudoku from "sudoku"
import { saveAs } from 'file-saver'

let entryToBoard = (square, i) => {
  let row = Math.floor(i / 3)
  let col = i % 3
  let rowOffset = Math.floor(square / 3) * 3
  let colOffset = square % 3 * 3
  row += rowOffset
  col += colOffset
  return col * 9 + row
}

let socket = makeSocket()
let components = new Set()

function checkSocket() {
  if (document.visibilityState === 'visible') {
    console.log("Checking socket health...")
    if (socket && socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING) {
      console.log("Remounting, websocket was ", socket.readyState)
      socket.close()
      socket = makeSocket()
    }
  }
}

function socketOnMessage(message) {
  let parsed = JSON.parse(message.data)
  if (parsed.intent === "make move") {
    components.forEach(c => {
      let board = c.state.board
      board[entryToBoard(parsed.square, parsed.i)] = parsed.val
      let incorrects = c.state.incorrects
      incorrects[entryToBoard(parsed.square, parsed.i)] = 0
      c.setState({board, incorrects})
    })
  } else if (parsed.intent === "fetch board") {
    for (let c of components) {
      socket.send(JSON.stringify({
        intent: "send board",
        board: c.state.board,
        difficulty: c.state.difficulty,
        originalBoard: c.state.originalBoard,
        incorrects: c.state.incorrects
      }))
      break // We only want 1 socket.send per-client, but each client can have multiple wrapped components
    }
  } else if (parsed.intent === "send board") {
    components.forEach(c => c.setState({
      board: parsed.board,
      difficulty: parsed.difficulty,
      originalBoard: parsed.originalBoard,
      incorrects: parsed.incorrects,
      updated: true
    }))
  } else if (parsed.intent === "validate board") {
    components.forEach(c => c.setState({
      incorrects: parsed.incorrects
    }))
  }
}

function socketOnOpen() {
  setTimeout(() => {
    components.forEach(c => {
      if (!c.state.updated) {
        c.setState({ updated: true })
        console.log("No board received...")
      }
    })
  }, 3000)
  console.log("Fetching board...")
  socket.send(JSON.stringify({intent: "fetch board"}))
  components.forEach(c => c.setState({
    socket
  }))
}

function makeSocket() {
  let result = new WebSocket("wss://djs.chilly.blue/sudoku/" + (window.location.pathname.slice(1) || 1))
  document.addEventListener("visibilitychange", checkSocket)
  result.addEventListener('message', socketOnMessage)
  result.addEventListener('open', socketOnOpen)
  return result
}

function withSocket(Wrapped) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        board: new Array(81).fill(""),
        originalBoard: new Array(81).fill(""),
        incorrects: new Array(81).fill(""),
        difficulty: "",
        updated: false
      }
      this.update = this.update.bind(this)
      this.sendBoard = this.sendBoard.bind(this)
      this.validate = this.validate.bind(this)
      this.saveGame = this.saveGame.bind(this)
      this.loadGame = this.loadGame.bind(this)
    }

    componentDidMount() {
      console.log("Wrapping component...")
      this.setState({i: components.length}, () => components.add(this))
    }

    componentWillUnmount() {
      console.log("Unwrapping component...")
      components.delete(this)
    }

    update(square, i, val) {
      let board = this.state.board.slice()
      board[entryToBoard(square, i)] = val
      let incorrects = this.state.incorrects.slice()
      incorrects[entryToBoard(square, i)] = 0
      if (this.state.updated && socket && this.state.originalBoard[entryToBoard(square, i)] === "") {
        socket.send(JSON.stringify({
          intent: "make move",
          square,
          i,
          val
        }))
        this.setState({board, incorrects})
      }
    }

    sendBoard(board, difficulty) {
      if (this.state.updated && socket) {
        socket.send(JSON.stringify({
          intent: "send board",
          board,
          difficulty,
          incorrects: this.state.incorrects,
          originalBoard: board.slice()
        }))
        this.setState({board, difficulty, originalBoard: board.slice()})
      }
    }

    validate() {
      if (this.state.updated && socket) {
        let solution = sudoku.solvepuzzle(
          this.state.originalBoard.map(i => i === "" ? null : parseInt(i - 1))
        )
        solution = solution.map(i => i === null ? "" : i + 1)
        let incorrects = this.state.board.map((e, i) => {
          if (e !== "" && parseInt(e) !== solution[i]) {
            return 1
          }
          return 0
        })
        socket.send(JSON.stringify({
          intent: "validate board",
          incorrects
        }))
        this.setState({incorrects})
      }
    }

    saveGame() {
      let game = JSON.stringify(this.state)
      var blob = new Blob([game], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "my.sudoku");
    }

    loadGame(text) {
      let game = JSON.parse(text)
      if (!game.difficulty) {
        let generatedPuzzle = game.originalBoard.map(i => (i !== "") ? i - 1 : null)
        let difficulty = sudoku.ratepuzzle(generatedPuzzle, 20)
        game.difficulty = difficulty
      }
      this.setState(game)
      socket = makeSocket()
    }

    render() {
      return <Wrapped
        board={this.state.board}
        originalBoard={this.state.originalBoard}
        update={this.update}
        entryToBoard={entryToBoard}
        updated={this.state.updated}
        sendBoard={this.sendBoard}
        difficulty={this.state.difficulty}
        validate={this.validate}
        incorrects={this.state.incorrects}
        saveGame={this.saveGame}
        loadGame={this.loadGame}
      />
    }
  }
}

export default withSocket