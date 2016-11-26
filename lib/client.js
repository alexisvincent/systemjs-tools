import 'systemjs-hmr/dist/next.js'
import io from 'socket.io-client'

const storage = {
    _socket: null
}

const run = (name, fn, ...args) => (
    storage[name] ?
        storage[name] :
        Promise.resolve(fn.apply(args)).then(result => {
            storage[name] = result || true
        })
)

const defaultOptions = {
    port: 1337
}

let config = {}

const connect = (opts = {}) => {
    const options = Object.assign({}, defaultOptions, opts)

    if (storage._socket == null) {

        let socket = storage._socket = io("https://" + window.location.hostname + ":" + options.port)

        socket.on('connect', () => {
            socket.emit('identification', navigator.userAgent)
        })

        socket.on('config', c => {
            config = c
        })

        socket.on('reload', () => {
            document.location.reload(true)
        })

        socket.on('change', (event) => {
            System.reload(event.path, {
                roots: config.entries
            })
        })
    }
}

export {storage, run, connect}
