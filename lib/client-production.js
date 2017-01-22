// import 'systemjs-hmr/next'
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'

const tools = {
  config: {
    protocol: 'https://',
    port: 7777,
    hostname: window.location.hostname
  }
}

export const passiveInit = (c = {}) => {
  if (!tools._.initialized) {

    tools.config = Object.assign({}, tools.config, c)

    tools.connect = (configOverride = {}) => {}
    // state.
  }
  return tools
}

export const connect = (configOverride = {}) => {
  const tools = passiveInit(configOverride)
  tools.connect()
  return tools
}
