import 'systemjs-hmr/dist/next.js'
import io from 'socket.io-client'
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'
import merge from 'deepmerge'

const tools = {
  _: {
    initialized: false,
  },
  config: {
    protocol: window.location.protocol,
    port: window.location.port,
    host: window.location.hostname
  }
}

export const passiveInit = (config) => {
  if (!tools.initialized) {

    tools.initialized = true
    tools.config = merge(tools.config, config)

    const {_, config} = tools

    tools.connect = (configOverride) => {

      const {protocol, port, host} = merge(config, configOverride)

      if (!_.socket) {
        _.socket = io(protocol + host + ":" + port)

        _.socket.on('connect', () => socket.emit('identification', navigator.userAgent))
        _.socket.on('reload', () => document.location.reload(true))
        _.socket.on('change', ({path, entries}) => System.reload(path, { roots: entries }))
      }
    }
    // state.
  }
  return tools
}

export const connect = (config) => {
  const tools = passiveInit(config)
  tools.connect()
  return tools
}
