import React from 'react'
import styled, { ThemeProvider } from "styled-components"
import withSocket from "../utils/socketSubscriber"
import withSettings from "../utils/settingsSubscriber"
import Cell from "./Cell"
import Settings from "./Settings"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import sudoku from "sudoku"

let AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${props => props.theme.background};
`

let ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

let ConnectionButton = styled.div`
  margin-bottom: unset;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme.buttonColor};
  background-color: ${props => props.updated ? props.theme.connectedColor : props.theme.connectingColor};
  display: inline-block;
  border-radius: 0.5rem;
  cursor: default;
  font-size: 2vmin;
`

let DifficultyIndicator = styled.div`
  margin: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: ${props => props.theme.textColor};
  display: inline-block;
  border-radius: 0.5rem;
  font-size: 2vmin;
  cursor: default;
`

let GameButton = styled.div`
  margin: 0.5rem;
  padding: 0.25rem 0;
  color: ${props => props.theme.textColor};
  display: inline-block;
  cursor: pointer;
  text-align: right;
  font-size: 2vmin;
  border-bottom: 1px solid transparent;

  &:hover {
    border-bottom: 1px solid ${props => props.theme.textColor};
  }
`

let StyledCogButton = styled.div`
  margin: 0 0.5rem;
  padding: 0.25rem 0;
  color: ${props => props.theme.textColor};
  display: inline-block;
  cursor: pointer;
  text-align: right;
  font-size: 2.5vmin;
`

let FileInput = styled.input`
  display: none;
`

let GridContainer = styled.div`
  display: grid;
  background-color: ${props => props.theme.squareGapColor};
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-row-gap: ${props => props.theme.squareGap};
  grid-column-gap: ${props => props.theme.squareGap};
  border: ${props => props.theme.bigBorder};
  box-sizing: border-box;
  width: 80vmin;
  height: 80vmin;
`

let Square = styled.div`
  display: grid;
  background-color: ${props => props.theme.cellGapColor};
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-row-gap: ${props => props.theme.cellGap};
  grid-column-gap: ${props => props.theme.cellGap};
`

let theme = {
  textColor: "black",
  buttonColor: "white",
  connectedColor: "#00AA4A",
  connectingColor: "#aaa",
  background: "white",
  cellBackground: "white",
  squareGap: "2px",
  cellGap: "1px",
  squareGapColor: "black",
  cellGapColor: "#aaa",
  bigBorder: "2px solid black",
  smallBorder: "1px solid #aaa",
  cellFocus: "rgba(100, 100, 100, 0.1)",
  noteColor: "#aaa",
  givenColor: "black",
  incorrectColor: "red",
  userColor: "#75aadb",
  highlightColor: "rgba(200, 230, 255, 0.5)",
}

theme = {
  textColor: "#ddd",
  buttonColor: "#222",
  connectedColor: "#62b586",
  connectingColor: "#aaa",
  background: "#222",
  cellBackground: "#444",
  squareGap: "6px",
  cellGap: "3px",
  squareGapColor: "#222",
  cellGapColor: "#222",
  bigBorder: "6px solid #222",
  smallBorder: "3px solid #222",
  cellFocus: "rgba(200, 200, 200, 0.1)",
  noteColor: "#999",
  givenColor: "#ddd",
  incorrectColor: "#d88",
  userColor: "#75aadb",
  highlightColor: "rgba(200, 230, 255, 0.3)",
}

class Grid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonPhase: 0,
      hoverSettings: false,
      settingsPhase: false,
      highlight: new Array(81).fill(0)
    }
    this.handleNewGame = this.handleNewGame.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleSettingsHover = this.handleSettingsHover.bind(this)
    this.handleSettingsLeave = this.handleSettingsLeave.bind(this)
    this.handleSettingsClick = this.handleSettingsClick.bind(this)
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
  
  handleSettingsHover() {
    this.setState({hoverSettings: true})
  }

  handleSettingsLeave() {
    this.setState({hoverSettings: false})
  }

  handleSettingsClick() {
    this.setState(pState => ({settingsPhase: !pState.settingsPhase}))
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
    console.log(this.props)
    return <ThemeProvider theme={theme}>
      <AppContainer>
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
              <StyledCogButton
                onClick={this.handleSettingsClick}
                onMouseEnter={this.handleSettingsHover}
                onMouseLeave={this.handleSettingsLeave}
              >
                <FontAwesomeIcon icon={faCog} spin={this.state.hoverSettings}/>
              </StyledCogButton>
            </div>
          </ButtonContainer>
          {
            !this.state.settingsPhase ? <GridContainer>
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
            </GridContainer> : <Settings/>
          }
        </div>
      </AppContainer>
    </ThemeProvider>
  }
}

export default withSettings(withSocket(Grid))