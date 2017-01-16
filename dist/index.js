'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _spdy = require('spdy');

var _spdy2 = _interopRequireDefault(_spdy);

var _handlers = require('./handlers');

var _config = require('./config');

var _systemjsBuilder = require('systemjs-builder');

var _systemjsBuilder2 = _interopRequireDefault(_systemjsBuilder);

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _death = require('death');

var _death2 = _interopRequireDefault(_death);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Subject = _Rx2.default.Subject;
var O = _Rx2.default.Observable;

var init = function init(configOverrides) {
  var _getConfig = (0, _config.getConfig)((0, _config.conform)(configOverrides)),
      config = _getConfig.config,
      valid = _getConfig.valid,
      errors = _getConfig.errors;

  if (!valid) throw new Error(errors);

  var tools = {
    config: config,
    _: {
      cache: {},
      // Builder instance (so we can share the cache)
      builder: new _systemjsBuilder2.default(_path2.default.join(config.directories.root, config.directories.baseURL)),
      events: new Subject(),
      // Construct for pipelining build operations (parallel is slower)
      promiseContext: {},
      then: function then(context, f) {
        return tools._.promiseContext[context] = (tools._.promiseContext[context] || _bluebird2.default.resolve()).then(f);
      },
      exitHandlers: [function () {
        return _bluebird2.default.resolve(_.log(':: gracefully shutting down'));
      }, function () {
        return _.persistCache();
      }]
    }
  };

  var _ = tools._;


  _.registerExitHandler = _.exitHandlers.push;

  _.exit = function () {
    _bluebird2.default.all(_.exitHandlers.map(function (handler) {
      return handler();
    })).then(function () {
      return process.exit(1);
    });
  };

  (0, _death2.default)(_.exit);

  _.log = function (message) {
    return _.events.next({ type: 'log', message: message });
  };
  _.warning = function (message) {
    return _.events.next({ type: 'warning', message: message });
  };
  _.error = function (message, error) {
    return _.events.next({ type: 'error', message: message, error: error });
  };
  _.fatal = function (message, error) {
    _.events.next({ type: 'fatal', message: message, error: error });
    _.exit();
  };

  _.events.subscribe(function (_ref) {
    var type = _ref.type,
        message = _ref.message,
        error = _ref.error;

    switch (type) {
      case 'log':
        console.log(message);
        break;
      case 'warning':
        console.warn('warning:', message);
        break;
      case 'error':
        console.error('error:', message, '\n', error);
        break;
      case 'fatal':
        console.error('fatal error:', message, '\n', error);

    }
  });

  _.loadCache = function () {
    try {
      _.cache = JSON.parse(_fs2.default.readFileSync(_path2.default.join(config.directories.root, config.cache), 'utf8'));
    } catch (error) {
      _.warning('Failed to load ' + _path2.default.join(config.directories.root, config.cache));
      _.cache = {};
    }

    if (_.cache.builder) _.builder.setCache(_.cache.builder);
  };

  _.persistCache = function () {
    _.cache.builder = _.builder.getCache();

    return _fs2.default.writeFile(_path2.default.join(config.directories.root, config.cache), JSON.stringify(_.cache), 'utf8').catch(function (err) {
      return _.error('Failed to persist cache', err);
    });
  };

  _.bundle = function (expression) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _.then('build', function () {
      _.log(':: bundling ' + expression);
      var bundlePromise = _.builder.bundle(expression, (0, _deepmerge2.default)(config.builder.options, options));
      bundlePromise.then(function () {
        return _.log(':: finished bundling ' + expression);
      });
      return bundlePromise;
    });
  };

  tools.analyse = _handlers.analyse;
  tools.handlers = (0, _handlers.makeHandlers)(tools);

  tools.serve = function () {
    var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _merge = (0, _deepmerge2.default)(config, { serve: configOverride }),
        _merge$serve = _merge.serve,
        server = _merge$serve.server,
        port = _merge$serve.port,
        keys = _merge$serve.keys,
        handler = _merge$serve.handler,
        finalHandler = _merge$serve.finalHandler,
        dir = _merge$serve.dir;

    handler = handler(tools);
    finalHandler = finalHandler(tools);

    server = server || _spdy2.default.createServer(keys, function (req, res) {
      return handler(req, res, function () {
        return finalHandler;
      });
    });

    server.listen(port, function (error) {
      error ? _.error('Couldn\'t start server on port ' + port, error) : _.log('Serving ' + dir + ' at https://localhost:' + port);
    });

    var socketServer = (0, _socket2.default)(server);

    var socketObservable = O.fromEvent(socketServer, 'connect');

    socketObservable.subscribe(function (socket) {

      O.fromEvent(socket, 'identification').do(console.log('connected client: '));

      _.events.filter(function (_ref2) {
        var type = _ref2.type;
        return type == 'hmr';
      }).subscribe(function (event) {
        return socket.emit('hmr', event);
      });
    });

    return {
      server: server,
      socketServer: socketServer,
      socketObservable: socketObservable
    };
  };

  _.builder.config({
    meta: {
      '@hot': {
        build: false
      }
    }
  });

  config.builder.configFiles.forEach(function (file) {
    try {
      _.builder.loadConfigSync(_path2.default.join(config.directories.root, file));
    } catch (error) {
      _.fatal('Couldn\'t load config ' + file, error);
    }
  });

  _.loadCache();

  _.fileChanged = function (absolutePath) {
    var relativePath = _path2.default.relative(config.directories.root, absolutePath);
    var url = _path2.default.join(_.builder.loader.getConfig().baseURL, _path2.default.relative(_path2.default.join(config.directories.root, config.directories.baseURL), absolutePath));

    _.events.next({ type: 'file-changed', absolutePath: absolutePath, relativePath: relativePath, url: url });
  };

  _.watchFileSystem = function () {
    var chokidarOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _.watcher = _chokidar2.default.watch(config.directories.root, (0, _deepmerge2.default)({
      ignored: ["**/jspm_packages", "**/node_modules", "**/icons"],
      ignoreInitial: true
    }, chokidarOptions));

    // Watch for changes (used to invalidate builder and hmr)
    _.watcher.on('all', function (event, changePath) {
      return _.fileChanged(changePath);
    });
  };

  // Watch for changes in the file system
  if (tools.config.watch) _.watchFileSystem();

  var fileChange = _.events.filter(function (_ref3) {
    var type = _ref3.type;
    return type == 'file-changed';
  });
  fileChange.subscribe(function (_ref4) {
    var relativePath = _ref4.relativePath;
    return console.log('File Changed:', relativePath);
  });
  fileChange.subscribe(function (_ref5) {
    var absolutePath = _ref5.absolutePath;
    return _.builder.invalidate(absolutePath);
  });

  // Generate hmr events from file changes
  fileChange.map(function (event) {
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

    return _extends({}, event, {
      type: 'hmr',
      entries: tools.entries
    });
  }).subscribe(_.events);

  // Bust files that have changed since last time systemjs-tools ran
  _.bustOldBuilderEntries = function () {
    if (_.cache.builder) {
      _.then('build', function () {
        return _bluebird2.default.all(Object.values(_.cache.builder.trace).map(function (t) {
          if (t.path) {
            (function () {
              var file = _path2.default.join(config.directories.root, config.directories.baseURL, t.path);

              _fs2.default.stat(file).then(function (stats) {
                if (stats.mtime.getTime() > t.timestamp) _.fileChanged(file);

                return _bluebird2.default.resolve();
              }).catch(function (err) {
                _.log('Can\'t open ' + _path2.default.relative(config.directories.root, file) + ', assuming it has been deleted');
                _.fileChanged(file);

                return _bluebird2.default.resolve();
              });
            })();
          }
        }));
      });
    }
  };

  _.bustOldBuilderEntries();

  if (config.entries.length > 0) {
    _.log(':: preemptively bundling app entries');
    config.entries.forEach(function (entry) {
      return _.bundle(entry, config.builder.options);
    });
  }

  return tools;
};

exports.init = init;