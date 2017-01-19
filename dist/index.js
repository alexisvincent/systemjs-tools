'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passiveInit = exports.init = undefined;

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Subject = _Rx2.default.Subject;

var init = function init(configOverrides) {

  /**
   * passive initialisation of systemjs-tools
   */

  var _getConfig = (0, _config.getConfig)((0, _config.conform)(configOverrides)),
      config = _getConfig.config,
      valid = _getConfig.valid,
      errors = _getConfig.errors;

  if (!valid) {
    var _console;

    (_console = console).error.apply(_console, _toConsumableArray(errors));
    process.exit(1);
  }

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
      exitHandlers: []
    }
  };

  var _ = tools._;

  // f: given (req, res) -> give us more information about the request

  tools.analyse = _handlers.analyse;

  // f: register a function that resolves to a promise which will be run when system exits
  _.registerExitHandler = function (handler) {
    return _.exitHandlers.push(handler);
  };

  // function to exit system
  _.exit = function () {
    _.log('gracefully shutting down');
    _bluebird2.default.all(_.exitHandlers.map(function (handler) {
      return handler();
    })).then(function () {
      return process.exit(1);
    });
  };

  // functions to centralize logging
  _.log = function () {
    for (var _len = arguments.length, messages = Array(_len), _key = 0; _key < _len; _key++) {
      messages[_key] = arguments[_key];
    }

    return _.events.next({ type: 'log', message: messages.join(' ') });
  };
  _.warn = function (message) {
    return _.events.next({ type: 'warning', message: message });
  };
  _.error = function (message, error) {
    return _.events.next({ type: 'error', message: message, error: error });
  };
  _.fatal = function (message, error) {
    _.events.next({ type: 'fatal', message: message, error: error });
    _.exit();
  };

  // f: load the internal cache from disk
  _.loadCache = function () {
    try {
      _.cache = JSON.parse(_fs2.default.readFileSync(_path2.default.join(config.directories.root, config.cache), 'utf8'));
    } catch (error) {
      _.warn('Failed to load ' + _path2.default.join(config.directories.root, config.cache));
      _.cache = {};
    }

    if (_.cache.builder) _.builder.setCache(_.cache.builder);
  };

  // f: save the internal cache to disk
  _.persistCache = function () {
    _.log('persisting cache');
    _.cache.builder = _.builder.getCache();

    return _fs2.default.writeFile(_path2.default.join(config.directories.root, config.cache), JSON.stringify(_.cache), 'utf8').catch(function (err) {
      return _.error('Failed to persist cache', err);
    });
  };

  // f: bundle the expression
  _.bundle = function (expression) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _.then('build', function () {
      _.log('bundling ' + expression);
      var bundlePromise = _.builder.bundle(expression, (0, _deepmerge2.default)(config.builder.options, options));
      bundlePromise.then(function () {
        return _.log('finished bundling ' + expression);
      });
      // bundlePromise.then(m => console.log(m.sourceMap))
      return bundlePromise;
    });
  };

  // f: start a development/production http2 server
  tools.serve = function () {
    var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _merge = (0, _deepmerge2.default)(config, { serve: configOverride }),
        _merge$serve = _merge.serve,
        server = _merge$serve.server,
        port = _merge$serve.port,
        keys = _merge$serve.keys,
        handler = _merge$serve.handler,
        dir = _merge$serve.dir,
        entries = _merge.entries;

    server = server || _spdy2.default.createServer(keys, handler(tools));

    server.listen(port, function (error) {
      error ? _.error('Couldn\'t start server on port ' + port, error) : _.log('serving ' + dir + ' at https://localhost:' + port);
    });

    tools.developmentChannel();

    // in next tick so we get nicer log ordering
    process.nextTick(function () {
      if (entries.length > 0) {
        _.log('preemptively bundling app entries');
        entries.forEach(function (entry) {
          return _.bundle(entry);
        });
      }
    });

    return {
      server: server
    };
  };

  // f: setup socket handler to proxy all system events to browser
  tools.developmentChannel = function () {
    var channelConfigOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _merge2 = (0, _deepmerge2.default)(config.channel, channelConfigOverride),
        port = _merge2.port,
        keys = _merge2.keys;

    var server = _spdy2.default.createServer(keys, function (req, res) {
      return res.end('systemjs-tools development channel');
    });

    server.listen(port, function (error) {
      // log if failed
      if (error) _.error('Couldn\'t start dev channel on port ' + port, error);
      // else start socket server
      else {
          _.log('dev channel started at https://localhost:' + port);

          var socketServer = (0, _socket2.default)(server);

          socketServer.on('connect', function (socket) {
            socket.on('identification', function () {
              return _.log('client connected to development channel');
            });

            // listen to system events
            _.events
            // filter for events the browser cares about
            .filter(function (_ref) {
              var type = _ref.type;
              return ['hmr'].indexOf(type) >= 0;
            })
            // and send them to browser
            .subscribe(function (event) {
              return socket.emit('*', event);
            });
          });
        }
    });
  };

  // f: notify system that a file has changed
  _.fileChanged = function (absolutePath) {
    var relativePath = _path2.default.relative(config.directories.root, absolutePath);
    var url = _path2.default.relative(config.directories.baseURL, absolutePath);

    _.events.next({ type: 'file-changed', absolutePath: absolutePath, relativePath: relativePath, url: url });
  };

  // f: watch file system and notify systemjs-tools when file changes
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

  // f: bust files that have changed since last time systemjs-tools ran
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

  /**
   * active initialisation of systemjs-tools
   */

  // print system messages
  _.events.subscribe(function (_ref2) {
    var type = _ref2.type,
        message = _ref2.message,
        error = _ref2.error,
        relativePath = _ref2.relativePath;

    switch (type) {
      case 'log':
        console.log('::', message);
        break;
      case 'warning':
        console.warn(':: warning ::', message);
        break;
      case 'error':
        console.error(':: error ::', message, '\n', error);
        break;
      case 'fatal':
        console.error(':: fatal error ::', message, '\n', error);
        break;
      case 'file-changed':
        _.log('file changed ::', relativePath);
    }
  });

  // listen for quit events and gracefully exit system
  (0, _death2.default)(_.exit);

  tools.handlers = (0, _handlers.makeHandlers)(tools);

  // Config entry to support systemjs-hmr
  _.builder.config({
    meta: {
      '@hot': {
        build: false
      }
    }
  });

  // Load config files
  config.builder.configFiles.forEach(function (file) {
    try {
      _.builder.loadConfigSync(_path2.default.join(config.directories.root, file));
    } catch (error) {
      _.fatal('Couldn\'t load config ' + file, error);
    }
  });

  // Load cache
  _.loadCache();
  _.registerExitHandler(function () {
    return _.persistCache();
  });

  // Watch for changes in the file system
  if (config.watch) _.watchFileSystem();

  _.bustOldBuilderEntries();

  var fileChange = _.events.filter(function (_ref3) {
    var type = _ref3.type;
    return type == 'file-changed';
  });
  fileChange.subscribe(function (_ref4) {
    var absolutePath = _ref4.absolutePath;
    return _.builder.invalidate(absolutePath);
  });

  // Generate hmr events from file changes
  fileChange.map(function (event) {
    return _extends({}, event, {
      type: 'hmr',
      entries: tools.entries
    });
  }).subscribe(_.events);

  return tools;
};

var passiveInit = function passiveInit() {
  var configOverrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return init((0, _deepmerge2.default)({
    watch: false
  }, configOverrides));
};

exports.init = init;
exports.passiveInit = passiveInit;