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
  return row * 9 + col
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
      this.makeSocket = this.makeSocket.bind(this)
      this.update = this.update.bind(this)
      this.sendBoard = this.sendBoard.bind(this)
      this.validate = this.validate.bind(this)
      this.saveGame = this.saveGame.bind(this)
      this.loadGame = this.loadGame.bind(this)
      window.saveGame = this.saveGame // Hack, for now
      window.loadGame = this.loadGame // Hack, for now
    }

    async componentDidMount() {
      console.log("Mounting...")
      this.makeSocket()

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') {
          console.log("Checking socket health...")
          if (this.state.socket && this.state.socket.readyState !== WebSocket.OPEN && this.state.socket.readyState !== WebSocket.CONNECTING) {
            console.log("Remounting, websocket was ", this.state.socket.readyState)
            this.state.socket.close()
            this.makeSocket()
          }
        }
      })
    }

    makeSocket() {
      let socket = new WebSocket("wss://djs.chilly.blue/sudoku/" + (window.location.pathname.slice(1) || 1))
      socket.addEventListener('message', message => {
        let parsed = JSON.parse(message.data)
        if (parsed.intent === "make move") {
          let board = this.state.board
          board[entryToBoard(parsed.square, parsed.i)] = parsed.val
          let incorrects = this.state.incorrects
          incorrects[entryToBoard(parsed.square, parsed.i)] = 0
          this.setState({board, incorrects})
        } else if (parsed.intent === "fetch board") {
          socket.send(JSON.stringify({
            intent: "send board",
            board: this.state.board,
            difficulty: this.state.difficulty,
            originalBoard: this.state.originalBoard,
            incorrects: this.state.incorrects
          }))
        } else if (parsed.intent === "send board") {
          this.setState({
            board: parsed.board,
            difficulty: parsed.difficulty,
            originalBoard: parsed.originalBoard,
            incorrects: parsed.incorrects,
            updated: true
          })
        } else if (parsed.intent === "validate board") {
          this.setState({
            incorrects: parsed.incorrects
          })
        }
      })
      socket.addEventListener('open', () => {
        setTimeout(() => {
          if (!this.state.updated) {
            this.setState({ updated: true })
            console.log("No board received...")
          }
        }, 3000)
        console.log("Fetching board...")
        socket.send(JSON.stringify({intent: "fetch board"}))
        this.setState({
          socket
        })
      })
      return socket
    }

    componentWillUnmount() {
      this.state.socket.close()
    }

    update(square, i, val) {
      let board = this.state.board.slice()
      board[entryToBoard(square, i)] = val
      let incorrects = this.state.incorrects.slice()
      incorrects[entryToBoard(square, i)] = 0
      if (this.state.updated && this.state.socket && this.state.originalBoard[entryToBoard(square, i)] === "") {
        this.state.socket.send(JSON.stringify({
          intent: "make move",
          square,
          i,
          val
        }))
        this.setState({board, incorrects})
      }
    }

    sendBoard(board, difficulty) {
      if (this.state.updated && this.state.socket) {
        this.state.socket.send(JSON.stringify({
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
      if (this.state.updated && this.state.socket) {
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
        this.state.socket.send(JSON.stringify({
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
      this.makeSocket()
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