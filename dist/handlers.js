'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var path = require('path');
var express = require('express');
var defaultFinalHandler = require('finalhandler');
var merge = require('deepmerge');
var httpProxy = require('http-proxy');
var url = require('url');
// var spdy = require('spdy-push');

var analyse = exports.analyse = function analyse(req, res) {
  var accept = req.get('accept');
  var initiatedBySystemJS = accept && accept.indexOf('application/x-es-module') !== -1;
  return { initiatedBySystemJS: initiatedBySystemJS };
};

var makeHandlers = exports.makeHandlers = function makeHandlers(_ref) {
  var _ = _ref._,
      config = _ref.config;


  var handlers = {
    static: function _static() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return express.static(path.join(config.directories.root, config.serve.dir), options);
    },

    bundle: function bundle() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return function (req, res, next) {
        var _merge = merge({
          bundleTrigger: 'dependencies.js'
        }, options),
            bundleTrigger = _merge.bundleTrigger;

        // Request can match with string, function or regex.


        var matchRequest = function matchRequest(req, match) {
          return typeof match === 'string' && (req.originalUrl.endsWith(match) || req.originalUrl.endsWith(match + '.map')) || typeof match === 'function' && match(req) || (typeof match === 'undefined' ? 'undefined' : _typeof(match)) === 'object' && match instanceof RegExp && match.exec(req.originalUrl);
        };

        // Simple case: mapping bundle trigger to request.
        var builder = void 0;
        if (matchRequest(req, bundleTrigger)) {
          builder = { expression: config.entries.join(' + ') };

          // Didn't match; look for mappings overrides.
        } else {
          (config.mappings || []).forEach(function (mapping) {
            if (matchRequest(req, mapping.match)) {
              if (!mapping.builder) {
                throw new Error('Builder options missing for mapping: ' + mapping.match);
              }
              builder = mapping.builder;
            }
          });
        }

        // Is this a mapped builder request?
        if (builder) {
          var builderOptions = merge(config.builder.options, builder.options || {});
          if (req.originalUrl.endsWith('.map')) {
            _.log('requesting ' + req.url + ' retrieving external sourcemap');
            _.bundle(builder.expression, builderOptions).then(function (_ref2) {
              var sourceMap = _ref2.sourceMap;
              return res.end(sourceMap);
            });
          } else {
            _.log('requesting ' + req.url + ' triggering bundling');
            _.bundle(builder.expression, builderOptions).then(function (_ref3) {
              var source = _ref3.source,
                  sourceMap = _ref3.sourceMap;
              return res.end(options.sourceMaps === 'inline' || !sourceMap ? source : source + ('\n//# sourceMappingURL=' + path.basename(req.originalUrl) + '.map'));
            });
          }
        } else {
          next();
        }
      };
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

    proxyHandler: function proxyHandler() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var proxyUrl = config.proxy || options.proxy;
      _.log('setting up proxy to ' + proxyUrl);
      var proxy = httpProxy.createProxyServer({ protocolRewrite: 'https:', autoRewrite: true, secure: 'secure' in options ? options.secure : false });
      var target = url.parse(proxyUrl);

      proxy.on('proxyReq', function (proxyReq, req, res, proxyOptions) {
        proxyReq.setHeader('X-Forwarded-Proto', 'https');
      });

      proxy.on('proxyRes', function (proxyRes, req, res, proxyOptions) {
        var location = proxyRes.headers['location'];
        if (location) {
          var u = url.parse(location);
          u.host = target.host;
          proxyRes.headers['location'] = url.format(u);
        }

        delete proxyRes.headers['transfer-encoding'];
      });

      proxy.on('error', function (e) {
        console.error(e);
      });

      return function (req, res, next) {
        _.log(req.method + ' https://' + req.headers.host + req.originalUrl + ' => ' + proxyUrl);
        return proxy.web(req, res, { target: proxyUrl });
      };
    },

    fallthroughHandler: function fallthroughHandler() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _merge2 = merge({
        fallthroughHandler: function fallthroughHandler(req, res) {
          defaultFinalHandler(req, res)();
        }
      }, options),
          fallthroughHandler = _merge2.fallthroughHandler;

      return fallthroughHandler;
    },

    defaultHandler: function defaultHandler() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var app = express();
      app.use(handlers.bundle());
      app.use(handlers.static());
      if (config.proxy) {
        app.use(handlers.proxyHandler());
      }
      app.use(handlers.fallthroughHandler());
      return app;
    }
  };

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

  return handlers;
};