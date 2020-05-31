import React from "react"
import styled from "styled-components"
import Notes from "./Notes"

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
  text-shadow: 0 0 0 ${props => props.isOriginal ? "black" : props.isIncorrect ? "red" : "#75aadb"};
  font-size: ${props => parseInt(props.value) / 10 < 1 ? "4vmin" : "1vmin"};
  background-color: ${props => props.highlight ? "rgba(200, 230, 255, 0.5)": "transparent"};
  cursor: pointer;
  
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