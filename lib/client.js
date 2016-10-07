import io from 'socket.io-client'
import {HotReloader} from 'systemjs-hmr'

import {reloadStore, runOnce} from './acrossReload'

let reloader = null

const connect = (port) => {

    const endpoint = "//" + window.location.hostname + ":" + port

    if (reloader == null) {
        reloader = new HotReloader(endpoint)
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