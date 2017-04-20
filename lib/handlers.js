const path = require('path')
const express = require('express')
const defaultFinalHandler = require('finalhandler')
const merge = require('deepmerge')
const httpProxy = require('http-proxy')
const url = require('url')
// var spdy = require('spdy-push');

export const analyse = (req, res) => {
  const accept = req.get('accept');
  const initiatedBySystemJS = accept && accept.indexOf('application/x-es-module') !== -1
  return {initiatedBySystemJS}
}

export const makeHandlers = ({_, config}) => {

  const handlers = {
    static: (options = {}) => express.static(path.join(config.directories.root, config.serve.dir), options),

    bundle: (options = {}) => (req, res, next) => {
      const {bundleTrigger} = merge({
        bundleTrigger: 'dependencies.js'
      }, options)

      if ((typeof bundleTrigger === 'string' && req.originalUrl.endsWith(bundleTrigger)) ||
        (typeof bundleTrigger == 'function' && bundleTrigger(req))) {
        _.log(`requesting ${req.url} triggering bundling`)
        _.bundle(config.entries.join(' + ')).then(({source}) => res.end(source))
      } else {
        next()
      }
    },

    // compile: () => (req, res, next) => {
    //   const toCompile = req.originalUrl.substring(1)
    //   // _.log(':: Compiling ', toCompile)
    //   _.then('build', () => (
    //     _.builder.compile(toCompile, config.builder.options).then(m => {
    //       res.end(m.source)
    //       console.log(':: Finished Compiling ', toCompile)
    //     })
    //     )
    //   )
    // },

    proxyHandler: (options = {}) => {
      _.log('setting up proxy to ' + config.proxy)
      let proxy = httpProxy.createProxyServer({protocolRewrite: 'https:', autoRewrite: true})
      let target = url.parse(config.proxy)

      proxy.on('proxyReq', (proxyReq, req, res, proxyOptions) => {
        proxyReq.setHeader('X-Forwarded-Proto', 'https')
      })

      proxy.on('proxyRes', (proxyRes, req, res, proxyOptions) => {
        var location = proxyRes.headers['location']
        if (location) {
          var u = url.parse(location)
          u.host = target.host
          proxyRes.headers['location'] = url.format(u)
        }

        delete proxyRes.headers['transfer-encoding']
      })

      proxy.on('error', function(e) {
        console.error(e)
      })

      return (req, res, next) => {
        _.log(`${req.method} https://${req.headers.host}${req.url} => ${config.proxy}`)
        return proxy.web(req, res, { target: config.proxy });
      }
    },

    defaultHandler: (options = {}) => {

      const {fallthroughHandler} = merge({
        fallthroughHandler: (req, res) => {
          defaultFinalHandler(req, res)()
        }
      }, options)

      const app = express()
      app.use(handlers.bundle())
      app.use(handlers.static())
      if (config.proxy) {
        app.use(handlers.proxyHandler());
      }
      app.use(fallthroughHandler)
      return app
    }
  }


  // const pushDeps = (req, res, next) => {
  //
  //   const {} = analyse(req, res)
  //
  //   tools._thenBuild(
  //     tools.builder.trace(req.originalUrl.slice(1)).then(trace => {
  //       return Promise.all(Object.keys(trace).map(depName => {
  //         return tools.jspm.normalize(depName).then(normalized => {
  //           return tools.builder.compile(normalized).then(compiled => {
  //             console.log('successfully compiled <>', path.relative(tools.serverRoot, trace[depName].path))
  //             var stream = res.push('/' + path.relative(tools.serverRoot, trace[depName].path), {
  //               status: 200, // optional
  //               method: 'GET', // optional
  //               request: {
  //                 accept: 'application/x-es-module, */*'
  //               },
  //               response: {
  //                 'content-type': 'application/javascript'
  //               }
  //             });
  //             stream.on('error', function (e) {
  //               console.log(e)
  //             });
  //             stream.end(compiled.source);
  //
  //             return Promise.resolve(depName)
  //
  //           }).catch((e) => {
  //             console.error("Failed to compile ", depName, e)
  //             return false
  //           })
  //         })
  //       }))
  //     }).then(compiled => {
  //       tools.builder.compile('app/app.js').then((compiled) => res.end(compiled.source))
  //     })
  //   )
  // }

  return handlers
}


