import React from 'react'
import Grid from './components/Grid'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import styled from "styled-components"

let AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  h1 {
    font-size: 10vw;
    border-right: solid black 2vw;
    padding: 2vw 4vw;
    margin-right: 4vw;
  }

  p {
    font-size: 2vw;
    font-weight: 900;
    margin-bottom: 0.5vw;
  }

  input {
    font-size: 2vw;
    border: solid black 0.2vw;
    padding: 0.2vw;
    margin-right: 5vw;

    &:focus {
      border: dashed black 0.2vw;
      outline: none;
    }
  }
`

let StyledLobbyInput = styled.input`

`

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lobby: "",
      redirect: false
    }
    this.handleInput = this.handleInput.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleInput(e) {
    this.setState({
      lobby: e.target.value,
      redirect: false
    })
  }

  handleKeyPress(e) {
    if (e.key === "Enter") this.setState({redirect: true})
  }

  render() {
    return <Router>
      {this.state.redirect && <Redirect push to={"/" + this.state.lobby} />}
      <div>
        <Switch>
          <Route path="/" exact={true}>
            <AppContainer>
              <h1>Sudoku</h1>
              <div>
                <p>Join a lobby</p>
                <StyledLobbyInput onInput={this.handleInput} onKeyPress={this.handleKeyPress}/>
              </div>
            </AppContainer>
          </Route>
          <Route path="/*">
            <Grid/>
          </Route>
        </Switch>
      </div>
    </Router>
  }
}

export default App;
