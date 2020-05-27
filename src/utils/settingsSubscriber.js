import React from "react"
import { SettingsContext } from "../components/SettingsProvider"

function withSettings(Wrapped) {
  class Result extends React.Component {
    render() {
      let settings = this.context
      return <Wrapped
        {...this.props}
        settings={settings}
      />
    }
  }
  Result.contextType = SettingsContext
  return Result
}

export default withSettings