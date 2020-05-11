import React from "react"

let entryToBoard = (square, i) => {
  let row = Math.floor(i / 3)
  let col = i % 3
  let rowOffset = Math.floor(square / 3) * 3
  let colOffset = square % 3 * 3
  row += rowOffset
  col += colOffset
  return col * 9 + row
}

function withSocket(Wrapped) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        board: new Array(81).fill(""),
        originalBoard: new Array(81).fill(""),
        updated: false
      }
      this.makeSocket = this.makeSocket.bind(this)
      this.update = this.update.bind(this)
      this.sendBoard = this.sendBoard.bind(this)
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
      let socket = new WebSocket("wss://djs.chilly.blue/" + (window.location.pathname.slice(1) || 1))
      socket.addEventListener('message', message => {
        let parsed = JSON.parse(message.data)
        if (parsed.intent === "make move") {
          let board = this.state.board
          board[entryToBoard(parsed.square, parsed.i)] = parsed.val[parsed.val.length - 1] || ""
          this.setState({board})
        } else if (parsed.intent === "fetch board") {
          socket.send(JSON.stringify({
            intent: "send board",
            board: this.state.board,
            originalBoard: this.state.originalBoard
          }))
        } else if (parsed.intent === "send board") {
          this.setState({
            board: parsed.board,
            originalBoard: parsed.originalBoard,
            updated: true
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
      board[entryToBoard(square, i)] = val[val.length - 1] || ""
      if (this.state.updated && this.state.socket && this.state.originalBoard[entryToBoard(square, i)] === "") {
        this.state.socket.send(JSON.stringify({
          intent: "make move",
          square,
          i,
          val
        }))
        this.setState({board})
      }
    }

    sendBoard(board) {
      if (this.state.updated && this.state.socket) {
        this.state.socket.send(JSON.stringify({
          intent: "send board",
          board
        }))
        this.setState({board, originalBoard: board.slice()})
      }
    }

    render() {
      return <Wrapped
        board={this.state.board}
        originalBoard={this.state.originalBoard}
        update={this.update}
        entryToBoard={entryToBoard}
        updated={this.state.updated}
        sendBoard={this.sendBoard}
      />
    }
  }
}

export default withSocket