import React from 'react'
import styled from "styled-components"

let CellContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  background-color: ${props => props.theme.cellBackground};
`

let StyledCell = styled.input`
  border: unset;
  outline: none;
  width: unset;
  height: unset;
  min-width: 0;
  min-height: 0;
  text-align: center;
  color: transparent;
  text-shadow: 0 0 0 ${props => props.isOriginal ? props.theme.givenColor : props.isIncorrect ? props.theme.incorrectColor : props.theme.userColor};
  font-size: ${props => parseInt(props.value) / 10 < 1 ? "4vmin" : "1vmin"};
  background-color: ${props => props.highlight ? props.theme.highlightColor : "transparent"};
  cursor: pointer;
  z-index: 1;

  &:focus {
    background-color: ${props => props.theme.cellFocus};
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
  text-align: center;
  font-size: 3vmin;
  line-height: 3vmin;
  color: ${props => props.theme.noteColor};
  border: unset;
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

export default Cell