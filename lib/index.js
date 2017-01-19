import chokidar from 'chokidar'
import path from 'path'
import io from 'socket.io'
import spdy from 'spdy'
import {makeHandlers, analyse} from './handlers'
import {getConfig, conform} from './config'
import Builder from 'systemjs-builder'
import Rx from 'rxjs/Rx';
import fs from 'mz/fs'
import merge from 'deepmerge'
import death from 'death'
import Promise from 'bluebird'

const Subject = Rx.Subject

const init = (configOverrides) => {

  /**
   * passive initialisation of systemjs-tools
   */

  const {config, valid, errors} = getConfig(conform(configOverrides))

  if (!valid) {
    console.error(...errors)
    process.exit(1)
  }


  const tools = {
    config,
    _: {
      cache: {},
      // Builder instance (so we can share the cache)
      builder: new Builder(path.join(config.directories.root, config.directories.baseURL)),
      events: new Subject(),
      // Construct for pipelining build operations (parallel is slower)
      promiseContext: {},
      then: (context, f) => {
        return tools._.promiseContext[context] = (tools._.promiseContext[context] || Promise.resolve()).then(f)
      },
      exitHandlers: [],
    },
  }

  const {_} = tools

  // f: given (req, res) -> give us more information about the request
  tools.analyse = analyse

  // f: register a function that resolves to a promise which will be run when system exits
  _.registerExitHandler = (handler) => _.exitHandlers.push(handler)

  // function to exit system
  _.exit = () => {
    _.log(`gracefully shutting down`)
    Promise.all(_.exitHandlers.map(handler => handler())).then(() => process.exit(1))
  }

  // functions to centralize logging
  _.log = (...messages) => _.events.next({type: 'log', message: messages.join(' ')})
  _.warn = message => _.events.next({type: 'warning', message})
  _.error = (message, error) => _.events.next({type: 'error', message, error})
  _.fatal = (message, error) => {
    _.events.next({type: 'fatal', message, error})
    _.exit()
  }


  // f: load the internal cache from disk
  _.loadCache = () => {
    try {
      _.cache = JSON.parse(fs.readFileSync(path.join(config.directories.root, config.cache), 'utf8'))
    } catch (error) {
      _.warn(`Failed to load ${path.join(config.directories.root, config.cache)}`)
      _.cache = {}
    }

    if (_.cache.builder)
      _.builder.setCache(_.cache.builder)
  }

  // f: save the internal cache to disk
  _.persistCache = () => {
    _.log(`persisting cache`)
    _.cache.builder = _.builder.getCache()

    return fs.writeFile(
      path.join(config.directories.root, config.cache),
      JSON.stringify(_.cache),
      'utf8'
    ).catch(err => _.error('Failed to persist cache', err))
  }

  // f: bundle the expression
  _.bundle = (expression, options = {}) => (
    _.then('build', () => {
      _.log(`bundling ${expression}`)
      const bundlePromise = _.builder.bundle(expression, merge(config.builder.options, options))
      bundlePromise.then(() => _.log(`finished bundling ${expression}`))
      // bundlePromise.then(m => console.log(m.sourceMap))
      return bundlePromise
    }))

  // f: start a development/production http2 server
  tools.serve = (configOverride = {}) => {
    let {serve: {server, port, keys, handler, dir}, entries} = merge(config, {serve: configOverride})

    server = server || spdy.createServer(keys, handler(tools));

    server.listen(port, (error) => {
      error ?
        _.error(`Couldn't start server on port ${port}`, error) :
        _.log(`serving ${dir} at https://localhost:${port}`)
    })

    tools.developmentChannel()

    // in next tick so we get nicer log ordering
    process.nextTick(() => {
      if (entries.length > 0) {
        _.log('preemptively bundling app entries',)
        entries.forEach(entry => _.bundle(entry))
      }
    })

    return {
      server
    }
  }

  // f: setup socket handler to proxy all system events to browser
  tools.developmentChannel = (channelConfigOverride = {}) => {
    const {port, keys} = merge(config.channel, channelConfigOverride)

    const server = spdy.createServer(keys, (req, res) => res.end('systemjs-tools development channel'));

    server.listen(port, (error) => {
      // log if failed
      if (error) _.error(`Couldn't start dev channel on port ${port}`, error)
      // else start socket server
      else {
        _.log(`dev channel started at https://localhost:${port}`)

        const socketServer = io(server)

        socketServer.on('connect', socket => {
          socket.on('identification', () => _.log('client connected to development channel'))

          // listen to system events
          _.events
          // filter for events the browser cares about
            .filter(({type}) => ['hmr'].indexOf(type) >= 0)
            // and send them to browser
            .subscribe(event => socket.emit('*', event))
        })
      }
    })
  }

  // f: notify system that a file has changed
  _.fileChanged = (absolutePath) => {
    const relativePath = path.relative(config.directories.root, absolutePath)
    const url = path.relative(config.directories.baseURL, absolutePath)


    _.events.next({type: 'file-changed', absolutePath, relativePath, url})
  }

  // f: watch file system and notify systemjs-tools when file changes
  _.watchFileSystem = (chokidarOptions = {}) => {
    _.watcher = chokidar.watch(config.directories.root, merge({
      ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
      ignoreInitial: true
    }, chokidarOptions))

    // Watch for changes (used to invalidate builder and hmr)
    _.watcher.on('all', (event, changePath) => _.fileChanged(changePath))
  }

// f: bust files that have changed since last time systemjs-tools ran
  _.bustOldBuilderEntries = () => {
    if (_.cache.builder) {
      _.then('build', () => Promise.all(
        Object.values(_.cache.builder.trace).map((t) => {
          if (t.path) {
            const file = path.join(config.directories.root, config.directories.baseURL, t.path)

            fs.stat(file).then(stats => {
              if (stats.mtime.getTime() > t.timestamp)
                _.fileChanged(file)

              return Promise.resolve()
            }).catch(err => {
              _.log(`Can't open ${path.relative(config.directories.root, file)}, assuming it has been deleted`)
              _.fileChanged(file)

              return Promise.resolve()
            })
          }
        })
      ))
    }
  }

  /**
   * active initialisation of systemjs-tools
   */

  // print system messages
  _.events.subscribe(({type, message, error, relativePath}) => {
    switch (type) {
      case 'log':
        console.log('::', message)
        break;
      case 'warning':
        console.warn(':: warning ::', message)
        break;
      case 'error':
        console.error(':: error ::', message, '\n', error)
        break;
      case 'fatal':
        console.error(':: fatal error ::', message, '\n', error)
        break;
      case 'file-changed':
        _.log('file changed ::', relativePath)
    }
  })

  // listen for quit events and gracefully exit system
  death(_.exit)

  tools.handlers = makeHandlers(tools)

  // Config entry to support systemjs-hmr
  _.builder.config({
    meta: {
      '@hot': {
        build: false
      }
    }
  })

  // Load config files
  config.builder.configFiles.forEach(file => {
    try {
      _.builder.loadConfigSync(path.join(config.directories.root, file))
    } catch (error) {
      _.fatal(`Couldn't load config ${file}`, error)
    }
  })

  // Load cache
  _.loadCache()
  _.registerExitHandler(() => _.persistCache())

  // Watch for changes in the file system
  if (config.watch)
    _.watchFileSystem()

  _.bustOldBuilderEntries()

  const fileChange = _.events.filter(({type}) => type == 'file-changed')
  fileChange.subscribe(({absolutePath}) => _.builder.invalidate(absolutePath))

// Generate hmr events from file changes
  fileChange
    .map(event => {
      return {
        //must return upper modules as well
        ...event,
        type: 'hmr',
        entries: tools.entries
      }
    }).subscribe(_.events)

  return tools
}

const passiveInit = (configOverrides = {}) => {
  return init(merge({
    watch: false
  }, configOverrides))
}

export {init, passiveInit}

