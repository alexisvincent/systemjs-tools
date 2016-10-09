import 'systemjs-hmr'
import io from 'socket.io-client'

import {reloadStore, runOnce} from './acrossReload.js'

let socket = null

const connect = (port) => {

    if (socket == null) {

        socket = io("//" + window.location.hostname + ":" + port)

        socket.on('connect', () => {
            socket.emit('identification', navigator.userAgent)
        })

        socket.on('reload', () => {
            document.location.reload(true)
        })

        socket.on('change', (event) => {
            System.reload(event.path)
        })

    }
}

const defaultOptions = {
    port: 1337
}

const devtools = (opts = {}) => {
    const options = Object.assign({}, defaultOptions, opts)

    connect(options.port)
}

export {reloadStore, runOnce, devtools}
