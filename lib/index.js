/**
 * Created by alexisvincent on 2016/09/02.
 */
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs'
import jspm from 'jspm'
import io from 'socket.io'
import spdy from 'spdy'


import {
    handler,
} from './handlers'


const setupHMR = (tools) => {
    if (tools.hmr) {

        let cssFiles = new Set();

        tools.entries.forEach(entry =>
            tools._thenBuild(
                tools.builder.trace(entry).then((m) => {
                    Object.keys(m)
                        .filter(file => file.endsWith('.pcss'))
                        .forEach(f => cssFiles.add(f))
                })
            )
        )

        let socket = tools.socket

        /**
         * When a new client connects add it to a list and handle it disconnecting
         */
        socket.on('connect', soc => {
            soc.on('identification', (name) => {
                console.log('connected client: ', name)
            })
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
                    socket.emit(event, {path: file, file})
                })

            } else {
                socket.emit(event, {path: changePath, absolutePath})
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

    if (options.packagePath)
        try {
            fs.statSync(options.packagePath);
        } catch (e) {
            if (options.packagePath == '')
                error(`
JSPM Devtools:
        
        You did not provide a valid packagePath

`)
        }


    return valid
}

const make = (options) => {

    // Validate options
    if (!optionsValid(options))
        throw new Error()

    const optionDefaults = {
        entries: [],
        packagePath: process.cwd(),
        hmr: false, // Since hmr needs socket.io default to it off
        resolveHandler: ({resolvers, initiatedBySystemJS}) => (
            initiatedBySystemJS
                ? resolvers.bundle()
                : resolvers.next()
        ),
        port: 1337
    }

    const buildOptionDefaults = {
        sourceMaps: 'inline'
    }

    // Construct tools object from defaults and provided options
    const tools = Object.assign({}, optionDefaults, options)

    // Construct builder config from defaults and provided options
    tools.builderConfig = Object.assign({}, buildOptionDefaults, tools.builderConfig)

    // If no jspm instance was specified, set the default
    if (!tools.jspm) {
        jspm.setPackagePath(tools.packagePath)
        tools.jspm = jspm
    }

    // Construct for pipelining build operations (parallel is slower)
    tools._buildPromise = Promise.resolve();
    tools._thenBuild = f => {
        tools._buildPromise = tools._buildPromise.then(f)
    }

    // Builder instance (so we can share the cache)
    tools.builder = new tools.jspm.Builder();

    tools._loaderConfig = tools.builder.loader.getConfig()

    const baseURL = path.relative(tools.packagePath, tools._loaderConfig.baseURL.substr(7))

    // Watch for changes (used to invalidate builder and hmr)
    tools.watcher = chokidar.watch("./"+baseURL, {
        ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
        ignoreInitial: true
    })

    // Invalidate builder when anything happens to a file (imprecise)
    tools.watcher.on('all', (event, changePath) => {
        tools.builder.invalidate(changePath)
    })

    // Preemptively trace the entry and bundle (populate trace/compile cache)
    tools.entries.forEach(entry =>
        tools._thenBuild(
            tools.builder.bundle(entry, tools.builderConfig).then(() => {
                console.log(":: Preemptively Cached ", entry)
            })
        )
    )

    // Express handler
    tools.handler = handler(tools)

    tools.server = spdy.createServer(require('spdy-keys'), () => "Nothing to see here")
    tools.socket = io(tools.server)

    tools.server.listen(tools.port || 1337)

    // Setup HMR
    setupHMR(tools)

    return tools
}

export {make};

