import React from 'react'
import styled from "styled-components"
import withSocket from "../utils/socketSubscriber"
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
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: white;
  background-color: ${props => props.updated ? "#00AA4A" : "#aaa"};
  display: inline-block;
  border-radius: 0.5rem;
  cursor: pointer;
`

let DifficultyIndicator = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  border-radius: 0.5rem;
`

let GameButton = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  cursor: pointer;
  text-align: right;
`

let GridContainer = styled.div`
  width: min(80vw, 80vh);
  height: min(80vw, 80vh);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  border: 2px solid black;
`

let Square = styled.div`
  border-top: ${props => props.i / 3 >= 1 ? "2px solid black" : ""};
  border-left: ${props => props.i % 3 > 0 ? "2px solid black" : ""};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
`

let StyledCell = styled.input`
  border: unset;
  border-top: ${props => props.i / 3 >= 1 ? "1px solid #aaa" : ""};
  border-left: ${props => props.i % 3 > 0 ? "1px solid #aaa" : ""};
  outline: none;
  min-width: 0;
  width: unset;
  min-height: 0;
  height: unset;
  text-align: center;
  font-size: ${props => parseInt(props.value) / 10 < 1 ? "2rem" : "0.5rem"};
  color: transparent;
  text-shadow: 0 0 0 ${props => props.isOriginal ? "black" : props.isIncorrect ? "red" : "gray"};

  &:focus {
    outline: none;
  }
`

class Cell extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(i) {
    if (!isNaN(i.target.value) && i.target.value !== "0")
      this.props.update(this.props.square, this.props.i, i.target.value)
  }

  render() {
    return <StyledCell
      key={this.props.i}
      i={this.props.i}
      value={this.props.value}
      onChange={this.handleChange}
      isOriginal={this.props.isOriginal}
      isIncorrect={this.props.isIncorrect}
    />
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonPhase: 0
    }
    this.handleNewGame = this.handleNewGame.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }

  handleNewGame() {
    if (this.state.buttonPhase === 0)
      this.setState({buttonPhase: this.state.buttonPhase + 1})
    else {
      let generatedPuzzle = sudoku.makepuzzle()
      let board = generatedPuzzle.map(i => (i !== null) ? i + 1 : "")
      let difficulty = sudoku.ratepuzzle(generatedPuzzle, 20)
      this.props.sendBoard(board, difficulty)
      this.setState({buttonPhase: 0})
    }
  }

  handleLeave() {
    this.setState({buttonPhase: 0})
  }

  render() {
    return <AppContainer>
      <div>
        <ButtonContainer>
          <ConnectionButton updated={this.props.updated}>
            {this.props.updated ? "Connected" : "Connecting"}
          </ConnectionButton>
          {
            this.props.difficulty !== "" &&
              <DifficultyIndicator>{"Difficulty: " + this.props.difficulty}</DifficultyIndicator>
          }
          <div>
            {
              this.props.difficulty !== "" &&
                <GameButton onClick={this.props.validate}>
                  Validate
                </GameButton>
            }
            <GameButton onClick={this.handleNewGame} onMouseLeave={this.handleLeave}>
              {this.state.buttonPhase === 0 ? "New Game" : "Are you sure?"}
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
                      type="number"
                      square={square}
                      update={this.props.update}
                      key={i}
                      i={i}
                      value={this.props.board[this.props.entryToBoard(square, i)]}
                      isOriginal={this.props.originalBoard[this.props.entryToBoard(square, i)] !== ""}
                      isIncorrect={this.props.incorrects[this.props.entryToBoard(square, i)] === 1}
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