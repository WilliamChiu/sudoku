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
    font-size: 5rem;
    border-right: solid black 1rem;
    padding: 1rem 2rem;
    margin-right: 2rem;
  }

  p {
    font-weight: 900;
  }

  input {
    border: solid black 2px;
    padding: 0.2rem;
    margin-right: 5rem;

    &:focus {
      border: dashed black 2px;
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
    this.setState({lobby: e.target.value})
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
