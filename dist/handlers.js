'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var path = require('path');
var express = require('express');
var defaultFinalHandler = require('finalhandler');
var merge = require('deepmerge');
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

        if (typeof bundleTrigger === 'string' && req.originalUrl.endsWith(bundleTrigger) || typeof bundleTrigger == 'function' && bundleTrigger(req)) {
          _.bundle(config.entries.join(' + ')).then(function (_ref2) {
            var source = _ref2.source;
            return res.end(source);
          });
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


    defaultHandler: function defaultHandler() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _merge2 = merge({
        fallthroughHandler: defaultFinalHandler
      }, options),
          fallthroughHandler = _merge2.fallthroughHandler;

      var app = express();
      app.use(handlers.bundle());
      app.use(handlers.static());
      app.use(fallthroughHandler);
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