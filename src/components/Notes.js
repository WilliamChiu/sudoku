import React from "react"
import styled from "styled-components"

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

export default Notes