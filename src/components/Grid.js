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
`

let GameButton = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
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
  min-height: 0;
  text-align: center;
  font-size: 2rem;
  color: transparent;
  text-shadow: 0 0 0 ${props => props.isOriginal ? "black" : "gray"};

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
    if (!isNaN(i.target.value)) this.props.update(this.props.square, this.props.i, i.target.value)
  }

  render() {
    return <StyledCell
      key={this.props.i}
      i={this.props.i}
      value={this.props.value}
      onChange={this.handleChange}
      isOriginal={this.props.isOriginal}
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
    this.handleBlur = this.handleBlur.bind(this)
  }

  handleNewGame() {
    if (this.state.buttonPhase === 0)
      this.setState({buttonPhase: this.state.buttonPhase + 1})
    else {
      let board = sudoku.makepuzzle().map(i => i ? i : "")
      this.props.sendBoard(board)
      this.setState({buttonPhase: 0})
    }
  }

  handleBlur() {
    this.setState({buttonPhase: 0})
  }

  render() {
    return <AppContainer>
      <div>
        <ButtonContainer>
          <ConnectionButton updated={this.props.updated}>
            {this.props.updated ? "Connected" : "Connecting"}
          </ConnectionButton>
          <GameButton onClick={this.handleNewGame} onBlur={this.handleBlur}>
            {this.state.buttonPhase === 0 ? "New Game" : "Are you sure?"}
          </GameButton>
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