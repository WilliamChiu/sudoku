import React from "react"
import styled from "styled-components"
import { Select, MenuItem, FormControl, Input, InputAdornment } from '@material-ui/core/'


let SettingsContainer = styled.div`
  border: ${props => props.theme.bigBorder};
  width: 80vmin;
  height: 80vmin;
  background-color: ${props => props.theme.cellBackground};
  padding: 2vmin;
  box-sizing: border-box;
  position: relative;
`

let SettingsHeader = styled.div`
  font-size: 3vmin;
  display: inline-block;
  color: #ddd;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1vmin;
`

let Setting = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1vmin 0;

  div {
    font-size: 2vmin;
    color: #ddd;
  }
`

let StyledFormControl = styled(FormControl)`
  && {
    color: #ddd;
    width: 10vmin;

    .MuiInputBase-input {
      color: #ddd;
      font-size: 1.5vmin;
    }
    
    .MuiFormLabel-root, .MuiSelect-icon {
      color: #ddd;
    }

    .MuiInput-underline:after, .MuiInput-underline:hover:not(.Mui-disabled):before {
      border-bottom: 2px solid #ddd;
    }

    .MuiInput-underline:before {
      border-bottom: 1px solid #aaa;
    }

    .MuiTypography-colorTextSecondary {
      color: #ddd;
    }

    .MuiTypography-body1 {
      font-size: 2vmin;
    }
  }
`

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      themeOpen: false
    }
    this.openTheme = this.openTheme.bind(this)
    this.closeTheme = this.closeTheme.bind(this)
  }

  openTheme() {
    this.setState({themeOpen: true})
  }

  closeTheme() {
    this.setState({themeOpen: false})
  }

  render() {
    return <SettingsContainer>
      <SettingsHeader>
        Aesthetics
      </SettingsHeader>
      <Setting>
        <div
          onClick={this.openTheme}
        >
          Theme
        </div>
        <StyledFormControl>
          <Select
            open={this.state.themeOpen}
            onOpen={this.openTheme}
            onClose={this.closeTheme}
          >
            <MenuItem value={0}>Dark</MenuItem>
            <MenuItem value={1}>Light</MenuItem>
          </Select>
        </StyledFormControl>
      </Setting>
      <Setting>
        <div>
          Size
        </div>
        <StyledFormControl>
          <Input
            endAdornment={<InputAdornment position="end">%</InputAdornment>}
          />
        </StyledFormControl>
      </Setting>
      <Setting>
        <div>
          Cell Font Size
        </div>
        <StyledFormControl>
          <Input
            endAdornment={<InputAdornment position="end">vmin</InputAdornment>}
          />
        </StyledFormControl>
      </Setting>
      <Setting>
        <div>
          Notes Font Size
        </div>
        <StyledFormControl>
          <Input
            endAdornment={<InputAdornment position="end">vmin</InputAdornment>}
          />
        </StyledFormControl>
      </Setting>
    </SettingsContainer>
  }
}

export default Settings