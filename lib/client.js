import 'systemjs-hmr'
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

const connect = (port) => {

    if (storage._socket == null) {

        let socket = storage._socket = io("https://" + window.location.hostname + ":" + port)

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

export {storage, run, devtools}
