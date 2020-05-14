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
  font-size: 2vmin;
`

let DifficultyIndicator = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  border-radius: 0.5rem;
  font-size: 2vmin;
`

let GameButton = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: black;
  display: inline-block;
  cursor: pointer;
  text-align: right;
  font-size: 2vmin;
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

let CellContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
`

let StyledCell = styled.input`
  border: unset;
  border-top: ${props => props.i / 3 >= 1 ? "1px solid #aaa" : ""};
  border-left: ${props => props.i % 3 > 0 ? "1px solid #aaa" : ""};
  outline: none;
  width: unset;
  height: unset;
  min-width: 0;
  min-height: 0;
  text-align: center;
  color: transparent;
  text-shadow: 0 0 0 ${props => props.isOriginal ? "black" : props.isIncorrect ? "red" : "#b9d9eb"};
  font-size: ${props => parseInt(props.value) / 10 < 1 ? "4vmin" : "1vmin"};
  background-color: ${props => props.highlight ? "rgba(200, 230, 255, 0.5)": "transparent"};
  
  &:focus {
    background-color: rgba(100, 100, 100, 0.1);
  }
  
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[type=number] {
    -moz-appearance:textfield;
  }
  
  &[type=number] {
    margin: 0;
  }

  &:focus {
    outline: none;
  }
`

let StyledNotes = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  z-index: -1;
  text-align: center;
  font-size: 3vmin;
  line-height: 3vmin;
  color: #aaa;
  border: unset;
  border-top: ${props => props.i / 3 >= 1 ? "1px solid #aaa" : ""};
  border-left: ${props => props.i % 3 > 0 ? "1px solid #aaa" : ""};
`

class Notes extends React.Component {
  render() {
    return <StyledNotes i={this.props.i}>
      {
        [...Array(9)].map((_,i) => {
          // I am so sorry for that nasty string manipulation
        return <div key={i}>{this.props.value.includes(i+1+"") ? i+1 : ""}</div>
        })
      }
    </StyledNotes>
  }
}


class Cell extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleChange(i) {
    /**
     * If props.value is type string, we have a single entry for the square, or no entry at all.
     * If it is an array, we are taking notes.
     * Open to refactoring this gibberish.
     */
    if (typeof this.props.value === "string") {
      if (i.target.value === "") this.props.update(this.props.square, this.props.i, "")
      else if (i.target.value.length === 1) this.props.update(this.props.square, this.props.i, i.target.value)
      else {
        let val = [...new Set(i.target.value.split(""))]
        this.props.update(this.props.square, this.props.i, val)
      }
    }
    else {
      if (this.props.value.includes(i.target.value) && this.props.value.length === 1)
        this.props.update(this.props.square, this.props.i, i.target.value)
      else if (this.props.value.includes(i.target.value)) {
        let val = this.props.value.filter(e => e !== i.target.value)
        this.props.update(this.props.square, this.props.i, val)
      }
      else {
        let val = this.props.value.slice()
        val.push(i.target.value)
        this.props.update(this.props.square, this.props.i, val)
      }
    }
  }

  handleKeyPress(e) {
    if (isNaN(e.key) || e.key === "0") e.preventDefault()
    if (e.key === "h") this.props.handleHighlight(this.props.square, this.props.i, "toggle")
    else if (e.key === "c") this.props.handleHighlight(this.props.square, this.props.i, "clear")
  }

  render() {
    return <CellContainer>
      { typeof this.props.value === "object" && <Notes
          value={this.props.value}
          i={this.props.i}
        />
      }
      <StyledCell
        type="number"
        key={this.props.i}
        i={this.props.i}
        value={typeof this.props.value !== "object" ? this.props.value : ""}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
        isOriginal={this.props.isOriginal}
        isIncorrect={this.props.isIncorrect}
        highlight={this.props.highlight}
      />
    </CellContainer>
  }
}

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