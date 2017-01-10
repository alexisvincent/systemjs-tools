/**
 * Created by alexisvincent on 2016/09/02.
 */
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
const O = Rx.Observable

const init = (configOverrides) => {

  const {config, valid, errors} = getConfig(conform(configOverrides))

  if (!valid) throw new Error(errors)

  const tools = {
    config,
    _: {
      cache: {},
      // Builder instance (so we can share the cache)
      builder: new Builder(config.directories.baseURL),
      subject: new Subject(),
      // Construct for pipelining build operations (parallel is slower)
      promiseContext: {},
      then: (context, f) => {
        return tools._.promiseContext[context] = (tools._.promiseContext[context] || Promise.resolve()).then(f)
      },
      exitHandlers: [
        () => Promise.resolve(_.log(`Gracefully shutting down`)),
        () => _.persistCache()
      ],
    },
  }

  const {_} = tools

  _.registerExitHandler = _.exitHandlers.push

  _.exit = () => {
    Promise.all(_.exitHandlers.map(handler => handler())).then(() => process.exit(1))
  }

  death(_.exit)

  _.log = message => _.subject.next({type: 'log', message})
  _.warning = message => _.subject.next({type: 'warning', message})
  _.error = (message, error) => _.subject.next({type: 'error', message, error})
  _.fatal = (message, error) => {
    _.subject.next({type: 'fatal', message, error})
    _.exit()
  }

  _.subject.subscribe(({type, message, error}) => {
    switch (type) {
      case 'log':
        console.log(message)
        break;
      case 'warning':
        console.warn('warning:', message)
        break;
      case 'error':
        console.error('error:', message, '\n', error)
        break;
      case 'fatal':
        console.error('fatal error:', message, '\n', error)

    }
  })

  _.loadCache = () => {
    try {
      _.cache = JSON.parse(fs.readFileSync(path.join(config.directories.root, config.cache), 'utf8'))
    } catch (error) {
      _.error(`Failed to load ${path.join(config.directories.root, config.cache)}`)
      _.cache = {}
    }

    if (_.cache.builder) _.builder.setCache(_.cache.builder)
  }

  _.persistCache = () => {
    _.cache.builder = _.builder.getCache()

    return fs.writeFile(
      path.join(config.directories.root, config.cache),
      JSON.stringify(_.cache),
      'utf8'
    ).catch(err => _.error('Failed to persist cache', err))
  }

  _.bundle = (expression, options = {}) => {
    _.log(`:: bundling ${expression}`)

    _.then('build', () => {
      const bundlePromise = _.builder.bundle(expression, merge(config.builder.config, options))
      bundlePromise.then(() => _.log(`:: finished bundling ${expression}`))
      return bundlePromise
    })
  }

  tools.analyse = analyse
  tools.handlers = makeHandlers(tools)

  tools.serve = ({port, handler, keys, server} = {}) => {
    port = port || config.serve.port
    server = server || spdy.createServer(keys || tools.config.serve.keys, handler || tools.handlers.defaultHandler);

    server.listen(port, (error) => {
      error ?
        _.error(`Couldn't start server on port ${port}`, error) :
        _.log(`Serving ${config.directories.baseURL} at https://127.0.0.1:${port}`)
    })

    const socketServer = io(server)

    const socketObservable = O.fromEvent(socketServer, 'connect')

    socketObservable
      .subscribe(socket => {

        O.fromEvent(socket, 'identification')
          .do(console.log('connected client: '))

        _.subject
          .filter(({type}) => type == 'hmr')
          .subscribe(event => socket.emit('hmr', event))
      })

    return {
      server,
      socketServer,
      socketObservable
    }
  }

  _.builder.config({
    meta: {
      '@hot': {
        build: false
      }
    }
  })

  try {
    _.builder.loadConfigSync(tools.config.configFiles.jspm)
  } catch (error) {
    _.fatal(`Couldn't load config ${tools.config.configFiles.jspm}`, error)
  }

  _.loadCache()

  // Watch for changes in the file system
  if (tools.config.watch) {
    _.watcher = chokidar.watch(path.join(config.directories.root, config.directories.baseURL), {
      ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
      ignoreInitial: true
    })

    // Watch for changes (used to invalidate builder and hmr)
    _.watcher.on('all', (event, changePath) => {
      changePath = path.relative(path.join(config.directories.root, config.directories.baseURL), changePath)
      _.subject.next({
        type: 'file-changed',
        // event,
        relativePath: changePath,
        absolutePath: path.join(config.directories.root, config.directories.baseURL, changePath),
        url: path.join(config.baseURL, changePath)
      })
    })
  }

  const fileChange = _.subject.filter(({type}) => type == 'file-changed')

  fileChange.subscribe(({relativePath}) => console.log('File Changed:', relativePath))

  fileChange.subscribe(({absolutePath}) => _.builder.invalidate(absolutePath))

  // Generate hmr events from file changes
  fileChange
    .map(event => {
      // let cssFiles = new Set();
      //
      // tools.entries.forEach(entry =>
      //   ._thenBuild(
      //     tools.builder.trace(entry).then((m) => {
      //       Object.keys(m)
      //         .filter(file => file.endsWith('.pcss'))
      //         .forEach(f => cssFiles.add(f))
      //     })
      //   )
      // )
      /**
       * Deal with the special case when the changed file is a scss file
       * due to the face that we compile it as a whole.
       */
      // if (changePath.endsWith('.pcss')) {
      //   cssFiles.add(relativePath)
      //   cssFiles.forEach(file => {
      //     subject.next({
      //
      //       type: 'hmr',
      //
      //       relativePath,
      //       absolutePath,
      //       url,
      //
      //       // TODO: path and file are here as backwards compat for dev and should be removed
      //       path: relativePath,
      //       file: relativePath
      //     })
      //     socket.emit(event, {path: file, file})
      //   })

      return {
        ...event,
        type: 'hmr',
        entries: tools.entries
      }

    }).subscribe(_.subject)

  // Bust files that have changed since last time systemjs-tools ran
  if (_.cache.builder) {
    const trace = _.cache.builder.trace


    _.then('build', () => Promise.all(
      Object.values(trace).map((t) => {

        // console.log(config.directories.root, config.directories.baseURL, t.path)

        if (t.path)
          fs.stat(path.join(config.directories.root, config.directories.baseURL, t.path)).then(stats => {
            if (stats.mtime.getTime() > t.timestamp)
              _.subject.next({
                type: 'file-changed',
                // event,
                relativePath: t.path,
                absolutePath: path.join(config.directories.root, config.directories.baseURL, t.path),
                url: path.join(config.directories.baseURL, t.path)
              })

            return Promise.resolve()
          }).catch(err => console.log(err))
      })
    ))
  }

  // Preemptively trace the entry and bundle (populate trace/compile cache)
  if (config.entries.length > 0)
    _.log(':: preemptively bundling app entries')

  config.entries.forEach(entry => _.bundle(entry))

  return tools
}

export {init}

