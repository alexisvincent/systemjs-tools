/**
 * Created by alexisvincent on 2016/09/02.
 */
// import jspm from 'jspm'
import chokidar from 'chokidar'
import path from 'path'
import {
    bundle,
    bundleDeps,
    bundleEntry,
    compile,
    pushDeps,
    testHandler
} from './handlers'

const devtools = (options) => {

    // Validate options
    if (!optionsValid(options))
        throw new Error()

    const optionDefaults = {
        // Since hmr needs socket.io default to it off
        hmr: false,
    }

    const buildOptionDefaults = {
        sourceMaps: 'inline'
    }

    // Construct tools object from defaults and provided options
    const tools = Object.assign({}, optionDefaults, options)

    // Construct builder config from defaults and provided options
    tools.builderConfig = Object.assign({}, buildOptionDefaults, tools.builderConfig)

    // Construct for pipelining build operations (parallel is slower)
    tools._buildPromise = Promise.resolve();
    tools._thenBuild = f => {
        tools._buildPromise = tools._buildPromise.then(f)
    }

    // Builder instance (so we can share the cache)
    tools.builder = new tools.jspm.Builder();

    // Watch for changes (used to invalidate builder and hmr)
    tools.watcher = chokidar.watch(tools.serverRoot, {
        ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
        cwd: tools.serverRoot,
        ignoreInitial: true
    })

    // Invalidate builder when anything happens to a file (imprecise)
    tools.watcher.on('all', (event, changePath) => {
        tools.builder.invalidate(changePath)
    })

    // Preemptively trace the entry and bundle (populate trace/compile cache)
    if (tools.entry)
        tools._thenBuild(
            tools.builder.trace(tools.entry).then(trace => {
                return tools.builder.bundle(trace, tools.builderConfig)
            })
        )

    // Express handler
    tools.handler = handler(tools)

    // Setup HMR
    setupHMR(tools)

    return tools
}

const handler = (tools) => (req, res, next) => {
    const accept = req.get('accept');
    const isSystemJSRequest = accept && accept.indexOf('application/x-es-module') !== -1

    const file = path.join(tools.serverRoot, req.path, req.originalUrl)


    switch (tools.bundleHandler({req, isSystemJSRequest})) {
        case 'test': {
            break;
        }
        case 'pushDeps': {
            pushDeps(tools)(req, res, next)
            break;
        }

        case 'bundleEntry': {
            bundleEntry(tools)(req, res, next)
            break;
        }
        case 'bundleDeps': {
            bundleDeps(tools)(req, res, next)
            break;
        }
        case 'bundle': {
            bundle(tools)(req, res, next)
            break;
        }
        case 'compile': {
            compile(tools)(req, res, next)
            break;
        }
        case 'skip': {
            next()
        }
    }
}


const setupHMR = (tools) => {
    if (tools.hmr) {
        console.log("Enabling Hot Module Replacement")
        let clients = [];

        let cssFiles = new Set();

        if (tools.entry)
            tools._thenBuild(
                tools.builder.trace(tools.entry).then((m) => {
                    Object.keys(m)
                        .filter(file => file.endsWith('.pcss'))
                        .forEach(f => cssFiles.add(f))
                })
            )

        /**
         * When a new client connects add it to a list and handle it disconnecting
         */
        tools.io.on('connect', socket => {
            const index = clients.push(socket)

            socket.on('identification', (name) => {
                console.log('connected client: ', name)
            })

            socket.on('disconnect', () => clients.splice(index - 1, 1))
        })

        tools.watcher.on('all', (event, changePath) => {
            console.log('File ', changePath, ' emitted: ', event)
            let absolutePath = path.join(process.cwd(), changePath)

            /**
             * Deal with the special case when the changed file is a scss file
             * due to the face that we compile it as a whole.
             */
            if (changePath.endsWith('.pcss')) {
                console.log(Object.keys(tools.builder.cache.trace).filter(f => f.endsWith('.pcss')))
                cssFiles.add(changePath)
                console.log(tools.builder.invalidate(changePath))
                cssFiles.forEach(file => {
                    clients.forEach((socket) => socket.emit(event, {path: file, file}))
                })

            } else {
                clients.forEach((socket) => socket.emit(event, {path: changePath, absolutePath}))
            }
        })
    }
}

const optionsValid = (options = {}) => {

    let valid = true
    const error = msg => {
        console.error(msg)
        valid = false
    }

    if (options.serverRoot == undefined || options.serverRoot == null || options.serverRoot == '')
        error(`
JSPM Devtools:
        
        You did not provide a valid server root

`)

    if (options.hmr && options.io == null)
        error(`
JSPM Devtools:

        You provided options  
        
        { 
            hmr: true,
        }, 
        
        but have not provided an instance of socket.io, try 
        
        {
            hmr: true,
            io: socket_io(yourServer),
        }
        
`)

    return valid
}
export default devtools
