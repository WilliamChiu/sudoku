import React from 'react'
import styled from "styled-components"

let ChatContainer = styled.div`
  width: 40vmin;
  height: 80vmin;
  display: flex;
  flex-direction: column;
`

let ChatLog = styled.div`
  height: 100%;
`

let ChatInput = styled.input`

`

class Chat extends React.Component {
  render() {
    return <ChatContainer>
      <ChatLog/>
      <ChatInput/>
    </ChatContainer>
  }
}

export default Chat