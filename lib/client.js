// import 'systemjs-hmr/next'
import io from 'socket.io-client'
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'
import merge from 'deepmerge'
console.log('developement client')

const tools = {
  _: {
    initialized: false,
  },
  config: {
    protocol: 'https://',
    port: 7777,
    hostname: window.location.hostname
  }
}

export const passiveInit = (c = {}) => {
  if (!tools._.initialized) {
    tools._.initialized = true

    tools.config = merge(tools.config, c)

    const {_, config} = tools

    tools.connect = (configOverride = {}) => {

      const {protocol, port, hostname} = merge(config, configOverride)

      if (!_.socket) {
        _.socket = io(protocol + hostname + ":" + port, {secure: true})

        _.socket.on('connect', () => _.socket.emit('identification', navigator.userAgent))
        _.socket.on('reload', () => document.location.reload(true))
        _.socket.on('*', (event) => {
          switch(event.type) {
            case 'hmr': {
              const {url, entries} = event
              const URL = SystemJS._loader.baseURL + url
              System.reload(URL, { roots: entries }).then(x => {
                // console.log(`${URL} changed`, x)
              })
              break
            }
          }
        })
      }
    }
    // state.
  }
  return tools
}

export const connect = (configOverride = {}) => {
  const tools = passiveInit(configOverride)
  tools.connect()
  return tools
}
