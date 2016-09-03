/**
 * Created by alexisvincent on 2016/09/02.
 */
// import jspm from 'jspm'
import chokidar from 'chokidar'
import path from 'path'

const handler = (tools) => (req, res, next) => {
    const accept = req.get('accept');

    const isSystemJSRequest = accept && accept.indexOf('application/x-es-module') !== -1

    const file = path.join(tools.serverRoot, req.path, req.originalUrl);

    switch (tools.bundleHandler({req, isSystemJSRequest})) {
        case 'bundleEntry': {
            console.log('bundle-entry')
            tools.registerBuildOperation((next) => {
                tools.builder.bundle(tools.entry, tools.builderConfig).then(m => {
                    res.send(m.source)
                })
                next()
            })
            break;
        }
        case 'bundleDeps': {
            console.log('bundle-deps')
            tools.registerBuildOperation((next) => {
                tools.builder.bundle('app/app.js - [app/**/*]', tools.builderConfig).then(m => {
                    res.send(m.source)
                })
                next()
            })
            break;
        }
        case 'bundle': {
            console.log('bundle')
            tools.registerBuildOperation((next) => {
                tools.builder.bundle(file, tools.builderConfig).then(m => {
                    res.send(m.source)
                })
                next()
            })
            break;
        }
        case 'compile': {
            console.log('compile')
            tools.registerBuildOperation(next => {
                tools.builder.compile(file, tools.builderConfig).then(m => {
                    res.send(m.source)
                })
                next()
            })
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

        let cssFiles;

        if (tools.entry)
            tools.registerBuildOperation(next => {
                tools.builder.trace(tools.entry).then((m) => {
                    cssFiles = Object.keys(m).filter(file => file.endsWith('.pcss'))
                    next()
                })
            })

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
            if (changePath.endsWith('.ncss')) {
                cssFiles.add(changePath)
                cssFiles.forEach(file => {
                    clients.forEach((socket) => socket.emit(event, {path: file, file}))
                })

            } else {
                clients.forEach((socket) => socket.emit(event, {path: changePath, absolutePath}))
            }
        })
    }
}

const devtools = (serverRoot, {
    jspm,
    entry,
    builderConfig = {},
    hmr = false,
    io,
    bundleHandler
}) => {
    const builder = new jspm.Builder()


    const watcher = chokidar.watch(serverRoot, {
        ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
        cwd: serverRoot,
        ignoreInitial: true
    })

    watcher.on('all', (event, changePath) => {
        const invalidated = builder.invalidate(changePath)
        // console.log("invalidated: " + invalidated)
    })

    const tools = {
        serverRoot, jspm, builder, watcher, io, hmr, entry, bundleHandler,
        builderConfig: {
            sourceMaps: 'inline',
            // ...builderConfig,
        },
        _building: false,
        _buildQueue: [],
    }

    tools.nextBuildOperation = () => {
        if (!tools._building && tools._buildQueue.length != 0)
            tools._buildQueue.shift()()
    }

    tools.registerBuildOperation = f => {
        tools._buildQueue.push(() => {
            if (tools._building) {
                throw new Error("This should never happen")
            }

            tools._building = true

            f(() => {
                tools._building = false
                tools.nextBuildOperation()
            })
        })
        tools.nextBuildOperation()
    }

    // if (entry) {
    //     tools.registerBuildOperation((next) => {
    //         builder.trace(entry).then(() => {
    //             next()
    //         })
    //     })
    // }

    tools.handler = handler(tools)

    setupHMR(tools)

    return tools
}

export default devtools
