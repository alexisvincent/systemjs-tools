'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passiveInit = exports.init = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Subject = _Rx2.default.Subject;

var init = function init() {
  var configOverrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
      cache: {
        version: require(_path2.default.join(__dirname, '../package.json')).version,
        bundle: {},
        sfx: {}
      },
      // Builder instance (so we can share the cache)
      builder: new _systemjsBuilder2.default(_path2.default.join(config.directories.root, config.directories.baseURL)),

      // TODO: Make an event middleware system
      events: new Subject(),
      // Construct for pipelining build operations (parallel is slower)
      promiseContext: {},
      then: function then(context, f) {
        var nextPromise = (tools._.promiseContext[context] || _bluebird2.default.resolve()).then(f);
        tools._.promiseContext[context] = nextPromise.catch(function () {});
        return nextPromise;
      }
    }
  };

  var _ = tools._;

  // f: given (req, res) -> give us more information about the request

  tools.analyse = _handlers.analyse;

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
      var cache = JSON.parse(_fs2.default.readFileSync(_path2.default.join(config.directories.root, config.cache), 'utf8'));

      if (cache.version == _.cache.version) {

        // Since we can't persist promise values, we construct them on load
        Object.values(cache.bundle).forEach(function (bundleCache) {
          bundleCache.bundlePromise = _bluebird2.default.resolve(bundleCache.bundle);
        });

        _.cache = cache;

        if (_.cache.builder) _.builder.setCache(_.cache.builder);
        _.log('using cache found at ' + config.cache);
      } else {
        _.log('resetting cache :: cache@' + cache.version + ' <*> systemjs-tools@' + _.cache.version);
      }
    } catch (error) {
      _.warn('couldn\'t find a valid cache at ' + config.cache + '. Starting fresh :)');
    }
  };

  // request that the cache be persisted
  _.persistCache = function () {
    _.events.next({ type: 'persist-cache' });
  };

  _.invalidate = function (_ref) {
    var absolutePath = _ref.absolutePath;

    _.builder.invalidate(_path2.default.relative(config.directories.baseURL, absolutePath));

    var normalized = _path2.default.normalize(_path2.default.relative(_path2.default.join(config.directories.root, config.directories.baseURL), absolutePath));

    var rebundle = [];

    Object.values(_.cache.bundle).forEach(function (bundleCache) {
      bundleCache.bundle && bundleCache.bundle.modules.forEach(function (module) {
        if (_path2.default.normalize(module) == normalized) {
          rebundle.push([bundleCache.expression, bundleCache.options]);
          bundleCache.valid = false;
        }
      });
    });

    if (!config.lazy) rebundle.forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          expression = _ref3[0],
          options = _ref3[1];

      return _.bundle(expression, options);
    });
  };

  // f: bundle the expression
  _.bundle = function (expression) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var updateLastAccessed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;


    options = (0, _deepmerge2.default)(config.builder.options, options);
    var cacheName = expression + '#' + JSON.stringify(options);

    if (!_.cache.bundle[cacheName]) {
      // console.log('fresh')
      _.cache.bundle[cacheName] = {
        expression: expression,
        options: options,
        valid: false,
        bundling: false,
        bundle: null,
        bundlePromise: _bluebird2.default.resolve(),
        lastAccessed: Date.now()
      };
    }

    var cache = _.cache.bundle[cacheName];

    if (cache.valid && !cache.bundling) {
      // the cache is valid, so we do nothing
      _.log('serving cached bundle for ' + expression);
    } else if (cache.bundling) {
      // the cache is invalid but the expression is already being bundled, so we do nothing
      _.log('hooking into queued bundle request for ' + expression);
    } else {
      // the cache is invalid and no build process is happening... so LETS DO DIS

      // we are bundling
      cache.bundling = true;
      cache.bundlePromise = _.then('build', function () {
        _.log('bundling ' + expression + '...');
        _.log('options ' + JSON.stringify(options, null, true));
        cache.valid = true;

        // we are bundling, re-declared in-case it was switched in the previous tick
        cache.bundling = true;

        var start = new Date().getTime();
        return _.builder.bundle(expression, options).then(function (bundle) {
          _.persistCache();
          _.log('finished bundling ' + expression + '; took ' + (new Date().getTime() - start) + ' ms');

          cache.bundling = false;
          cache.bundle = bundle;

          return bundle;
        }).catch(function (err) {
          _.error('failed to bundle ' + expression, err);
        });
      });

      _.log('bundle request for ' + expression + ' queued...');
    }

    if (updateLastAccessed) cache.lastAccessed = Date.now();

    return cache.bundlePromise;
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
    if (!config.lazy) process.nextTick(function () {
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
            .filter(function (_ref4) {
              var type = _ref4.type;
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
    _.log('file-changed: ' + _path2.default.relative(config.directories.root, absolutePath));
    _.events.next({
      type: 'file-changed',
      absolutePath: absolutePath,
      relativePath: _path2.default.relative(config.directories.root, absolutePath),
      url: _path2.default.relative(config.directories.baseURL, absolutePath)
    });
  };

  // f: watch file system and notify systemjs-tools when file changes
  _.watchFileSystem = function () {
    var _ref5;

    var chokidarOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _.watcher = _chokidar2.default.watch(config.directories.root, (0, _deepmerge2.default)({
      cwd: process.cwd(),
      ignored: (_ref5 = ["**/jspm_packages", "**/node_modules", "**/icons", _path2.default.join(config.directories.root, config.cache)]).concat.apply(_ref5, _toConsumableArray(config.directories.ignored || [])),
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
  _.events.filter(config.log).subscribe(function (_ref6) {
    var type = _ref6.type,
        message = _ref6.message,
        error = _ref6.error,
        relativePath = _ref6.relativePath;

    switch (type) {
      case 'log':
        console.log('::', message);
        break;
      case 'warning':
        console.warn('::', message);
        break;
      case 'error':
        console.error(':: error ::', message, '\n\n', error, '\n');
        break;
      case 'fatal':
        console.error(':: fatal error ::', message, '\n\n', error, '\n');
        break;
      case 'file-changed':
        _.log('file changed ::', relativePath);
    }
  });

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

  // Watch for changes in the file system
  if (config.watch) _.watchFileSystem();

  _.bustOldBuilderEntries();

  _.events.fileChanged = _.events.filter(function (_ref7) {
    var type = _ref7.type;
    return type == 'file-changed';
  });

  // Invalidate builder on file change
  _.events.fileChanged.subscribe(function (event) {
    _.invalidate(event);
  });

  // persist cache on file change
  _.events.fileChanged.subscribe(function () {
    return _.persistCache();
  });

  // Generate hmr events from file changes
  _.events.fileChanged.map(function (event) {
    return _extends({}, event, {
      type: 'hmr',
      entries: config.entries
    });
  }).subscribe(_.events);

  // persist cache if persist-cache message received
  _.events.filter(function (_ref8) {
    var type = _ref8.type;
    return type == 'persist-cache';
  }).debounceTime(1000).subscribe(function () {
    _.log('persisting cache');
    _.cache.builder = _.builder.getCache();

    var cache = _extends({}, _.cache, {
      bundle: {}
    });

    Object.keys(_.cache.bundle).forEach(function (cacheName) {
      cache.bundle[cacheName] = _lodash2.default.omit(_.cache.bundle[cacheName], ['bundlePromise']);
    });

    return _fs2.default.writeFile(_path2.default.join(config.directories.root, config.cache), JSON.stringify(cache), 'utf8').catch(function (err) {
      return _.error('failed to persist cache', err);
    });
  });

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