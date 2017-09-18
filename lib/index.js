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
import Promise from 'bluebird'
import __ from 'lodash'

const Subject = Rx.Subject

const init = (configOverrides = {}) => {

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
      cache: {
        version: require(path.join(__dirname, '../package.json')).version,
        bundle: {},
        sfx: {}
      },
      // Builder instance (so we can share the cache)
      builder: new Builder(path.join(config.directories.root, config.directories.baseURL)),

      // TODO: Make an event middleware system
      events: new Subject(),
      // Construct for pipelining build operations (parallel is slower)
      promiseContext: {},
      then: (context, f) => {
        const nextPromise = (tools._.promiseContext[context] || Promise.resolve()).then(f)
        tools._.promiseContext[context] = nextPromise.catch(() => {
        })
        return nextPromise
      }
    },
  }

  const {_} = tools

  // f: given (req, res) -> give us more information about the request
  tools.analyse = analyse

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
      const cache = JSON.parse(fs.readFileSync(path.join(config.directories.root, config.cache), 'utf8'))

      if (cache.version == _.cache.version) {

        // Since we can't persist promise values, we construct them on load
        Object.values(cache.bundle).forEach((bundleCache) => {
          bundleCache.bundlePromise = Promise.resolve(bundleCache.bundle)
        })

        _.cache = cache

        if (_.cache.builder)
          _.builder.setCache(_.cache.builder)
        _.log(`using cache found at ${config.cache}`)
      } else {
        _.log(`resetting cache :: cache@${cache.version} <*> systemjs-tools@${_.cache.version}`)
      }
    } catch (error) {
      _.warn(`couldn't find a valid cache at ${config.cache}. Starting fresh :)`)
    }
  }

  // request that the cache be persisted
  _.persistCache = () => {
    _.events.next({type: 'persist-cache'})
  }

  _.invalidate = ({absolutePath}) => {
    _.builder.invalidate(path.relative(config.directories.baseURL, absolutePath))

    const normalized = path.normalize(
      path.relative(path.join(config.directories.root, config.directories.baseURL), absolutePath)
    )

    const rebundle = []

    Object.values(_.cache.bundle).forEach((bundleCache) => {
      bundleCache.bundle && bundleCache.bundle.modules.forEach((module) => {
        if (path.normalize(module) == normalized) {
          rebundle.push([bundleCache.expression, bundleCache.options])
          bundleCache.valid = false
        }
      })
    })

    if (!config.lazy)
      rebundle.forEach(([expression, options]) => _.bundle(expression, options))
  }

  // f: bundle the expression
  _.bundle = (expression, options = {}, updateLastAccessed = true) => {

    options = merge(config.builder.options, options)
    const cacheName = `${expression}#${JSON.stringify(options)}`

    if (!_.cache.bundle[cacheName]) {
      // console.log('fresh')
      _.cache.bundle[cacheName] = {
        expression,
        options,
        valid: false,
        bundling: false,
        bundle: null,
        bundlePromise: Promise.resolve(),
        lastAccessed: Date.now()
      }
    }

    const cache = _.cache.bundle[cacheName]

    if (cache.valid && !cache.bundling) {
      // the cache is valid, so we do nothing
      _.log(`serving cached bundle for ${expression}`)
    } else if (cache.bundling) {
      // the cache is invalid but the expression is already being bundled, so we do nothing
      _.log(`hooking into queued bundle request for ${expression}`)
    } else {
      // the cache is invalid and no build process is happening... so LETS DO DIS

      // we are bundling
      cache.bundling = true
      cache.bundlePromise = _.then('build', () => {
        _.log(`bundling ${expression}...`)
        _.log(`options ${JSON.stringify(options, null, true)}`)
        cache.valid = true

        // we are bundling, re-declared in-case it was switched in the previous tick
        cache.bundling = true

        const start = new Date().getTime();
        return _.builder
          .bundle(expression, options)
          .then((bundle) => {
            _.persistCache()
            _.log(`finished bundling ${expression}; took ${new Date().getTime() - start} ms`)

            cache.bundling = false
            cache.bundle = bundle

            return bundle
          }).catch((err) => {
            _.error(`failed to bundle ${expression}`, err)
          })
      })

      _.log(`bundle request for ${expression} queued...`)
    }

    if (updateLastAccessed)
      cache.lastAccessed = Date.now()

    return cache.bundlePromise
  }

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
    if (!config.lazy)
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
    _.log(`file-changed: ${path.relative(config.directories.root, absolutePath)}`);
    _.events.next({
      type: 'file-changed',
      absolutePath,
      relativePath: path.relative(config.directories.root, absolutePath),
      url: path.relative(config.directories.baseURL, absolutePath)
    })
  }

  // f: watch file system and notify systemjs-tools when file changes
  _.watchFileSystem = (chokidarOptions = {}) => {
    _.watcher = chokidar.watch(config.directories.root, merge({
      cwd: process.cwd(),
      ignored: ["**/jspm_packages", "**/node_modules", "**/icons", path.join(config.directories.root, config.cache)].concat(...(config.directories.ignored || [])),
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
  _.events
    .filter(config.log)
    .subscribe(({type, message, error, relativePath}) => {
      switch (type) {
        case 'log':
          console.log('::', message)
          break;
        case 'warning':
          console.warn('::', message)
          break;
        case 'error':
          console.error(':: error ::', message, '\n\n', error, '\n')
          break;
        case 'fatal':
          console.error(':: fatal error ::', message, '\n\n', error, '\n')
          break;
        case 'file-changed':
          _.log('file changed ::', relativePath)
      }
    })

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

  // Watch for changes in the file system
  if (config.watch)
    _.watchFileSystem()

  _.bustOldBuilderEntries()

  _.events.fileChanged = _.events.filter(({type}) => type == 'file-changed')

  // Invalidate builder on file change
  _.events.fileChanged.subscribe((event) => {
    _.invalidate(event)
  })

  // persist cache on file change
  _.events.fileChanged
    .subscribe(() => _.persistCache())

// Generate hmr events from file changes
  _.events.fileChanged
    .map(event => {
      return {
        // TODO: should return upper modules as well
        ...event,
        type: 'hmr',
        entries: config.entries
      }
    }).subscribe(_.events)

  // persist cache if persist-cache message received
  _.events.filter(({type}) => type == 'persist-cache')
    .debounceTime(1000)
    .subscribe(
      () => {
        _.log(`persisting cache`)
        _.cache.builder = _.builder.getCache()

        const cache = {
          ..._.cache,
          bundle: {}
        }

        Object.keys(_.cache.bundle).forEach(cacheName => {
          cache.bundle[cacheName] = __.omit(_.cache.bundle[cacheName], ['bundlePromise'])
        })

        return fs.writeFile(
          path.join(config.directories.root, config.cache),
          JSON.stringify(cache),
          'utf8'
        ).catch(err => _.error('failed to persist cache', err))
      })

  return tools
}

const passiveInit = (configOverrides = {}) => {
  return init(merge({
    watch: false
  }, configOverrides))
}

export {init, passiveInit}

