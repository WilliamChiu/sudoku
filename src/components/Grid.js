import React from 'react'
import styled from "styled-components"
import withSocket from "../utils/socketSubscriber"
import Cell from "./Cell"
import sudoku from "sudoku"

let AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

let ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

let ConnectionButton = styled.div`
  margin-bottom: unset;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  color: white;
  background-color: ${props => props.updated ? "#00AA4A" : "#aaa"};
  display: inline-block;
  border-radius: 0.5rem;
  cursor: default;
  font-size: 2vmin;
`

let DifficultyIndicator = styled.div`
  margin: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  border-radius: 0.5rem;
  font-size: 2vmin;
  cursor: default;
`

let GameButton = styled.div`
  margin: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  cursor: pointer;
  text-align: right;
  font-size: 2vmin;
  border-bottom: 1px solid transparent;

  &:hover {
    border-bottom: 1px solid black;
  }
`

let FileInput = styled.input`
  display: none;
`

let GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  border: 2px solid black;
  width: 80vmin;
  height: 80vmin;
`

let Square = styled.div`
  border-top: ${props => props.i / 3 >= 1 ? "2px solid black" : ""};
  border-left: ${props => props.i % 3 > 0 ? "2px solid black" : ""};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
`

class Grid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonPhase: 0,
      highlight: new Array(81).fill(0)
    }
    this.handleNewGame = this.handleNewGame.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleHighlight = this.handleHighlight.bind(this)
    this.fileInput = React.createRef()
  }

  componentDidMount() {
    this.fileInput.current.addEventListener("change", () => {
      let reader = new FileReader();
      reader.addEventListener('load', (event) => {
        this.props.loadGame(event.target.result)
      });
      reader.readAsText(this.fileInput.current.files[0])
    }, false)
  }

  handleNewGame() {
    if (this.state.buttonPhase === 0)
      this.setState({buttonPhase: this.state.buttonPhase + 1})
    else {
      let generatedPuzzle
      let board
      let difficulty
      while (true) {
        generatedPuzzle = sudoku.makepuzzle()
        board = generatedPuzzle.map(i => (i !== null) ? i + 1 : "")
        difficulty = sudoku.ratepuzzle(generatedPuzzle, 20)
        if (!window.minDiff || difficulty > window.minDiff) break
      }
      this.props.sendBoard(board, difficulty)
      this.setState({buttonPhase: 0})
    }
  }

  handleLeave() {
    this.setState({buttonPhase: 0})
  }

  handleHighlight(square, i, action) {
    if (action === "clear") {
      this.setState({highlight: new Array(81).fill(0)})
    }
    else if (action === "toggle") {
      let highlight = this.state.highlight.slice()
      highlight[this.props.entryToBoard(square, i)] = !highlight[this.props.entryToBoard(square, i)]
      this.setState({highlight})
    }
  }

  render() {
    return <AppContainer>
      <div>
        <ConnectionButton updated={this.props.updated}>
          {this.props.updated ? "Connected" : "Connecting"}
        </ConnectionButton>
        <ButtonContainer>
          <DifficultyIndicator>{this.props.difficulty !== "" ? "Difficulty: " + this.props.difficulty : ""}</DifficultyIndicator>
          <div>
            {
              this.props.difficulty !== "" &&
                <GameButton onClick={this.props.validate}>
                  Validate
                </GameButton>
            }
            {
              this.props.difficulty !== "" &&
                <GameButton onClick={this.props.saveGame}>
                  Save
                </GameButton>
            }
            <label>
              <GameButton>
                Load
              </GameButton>
              <FileInput type="file" ref={this.fileInput}/>
            </label>
            <GameButton onClick={this.handleNewGame} onMouseLeave={this.handleLeave}>
              {this.state.buttonPhase === 0 ? "New" : "Are you sure?"}
            </GameButton>
          </div>
        </ButtonContainer>
        <GridContainer>
          {
            [...Array(9)].map((_,square) => {
              return <Square key={square} i={square}>
                {
                  [...Array(9)].map((_,i) => {
                    return <Cell
                      square={square}
                      update={this.props.update}
                      key={i}
                      i={i}
                      value={this.props.board[this.props.entryToBoard(square, i)]}
                      isOriginal={this.props.originalBoard[this.props.entryToBoard(square, i)] !== ""}
                      isIncorrect={this.props.incorrects[this.props.entryToBoard(square, i)] === 1}
                      highlight={this.state.highlight[this.props.entryToBoard(square, i)]}
                      handleHighlight={this.handleHighlight}
                    />
                  })
                }
              </Square>
            })
          }
        </GridContainer>
      </div>
    </AppContainer>
  }
}

export default withSocket(Grid)