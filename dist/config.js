'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = require('path');
var merge = require('deepmerge');
var fs = require('fs');
var defaultKeys = require('spdy-keys');
var l = require('lodash');

/**
 * Recursively looks upwards for a directory containing one of (in order)
 * 1. systemjs.json
 * 2. package.json with systemjs key
 * @param dir
 * @returns {*}
 */
var findRoot = exports.findRoot = function findRoot() {
  var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();


  // Convert string dirs into a list of dir entries
  if (typeof dir === 'string') dir = dir.split(path.sep).filter(function (dir) {
    return dir != '';
  });

  // Return with error if we have exhausted all dirs and not found a root
  if (dir.length == 0) return { rootNotFound: true };

  var configs = {};

  // Attempt to load the config files
  try {
    configs.file = require(path.join.apply(path, ['/'].concat(_toConsumableArray(dir), ['systemjs-tools.js']))).config;
  } catch (e) {}
  try {
    configs.pjson = require(path.join.apply(path, ['/'].concat(_toConsumableArray(dir), ['package.json'])))['systemjs-tools'];
  } catch (e) {}

  var config = configs.file || configs.pjson;

  return config ? // if a systemjs-tools.js file or pjson.systemjs-tools key exists we've found root
  {
    rootConfig: merge({ // merge default root in with config
      directories: {
        root: path.join.apply(path, ['/'].concat(_toConsumableArray(dir)))
      }
    }, config)
  } : findRoot(dir.splice(0, dir.length - 1)); // Otherwise look in the parent directory
};

// TODO: Make this function return a copy of config instead of mutating it
var conform = exports.conform = function conform(config) {
  Object.keys(config).forEach(function (key) {
    if (config[key] === null || config[key] == undefined) delete config[key];else if (_typeof(config[key]) === 'object') conform(config[key]);
  });

  return config;
};

/**
 * Get the static config for systemjs-tools
 * @param configOverides
 * @returns {{config: {}, errors: (Iterable<K, V>|Array.<*>), valid: boolean}}
 */
var getConfig = exports.getConfig = function getConfig(configOverides) {
  var _findRoot = findRoot(),
      rootConfig = _findRoot.rootConfig,
      rootNotFound = _findRoot.rootNotFound;

  var jspm = {};

  if (!rootNotFound) {
    // Grab the package directory
    jspm.packageDir = rootConfig.directories && rootConfig.directories.jspmPackage || '.';

    try {
      jspm.config = require(path.join(rootConfig.directories.root, jspmPackageDir, 'package.json'));
    } catch (e) {}

    jspm.config = l.pick(merge({
      directories: {
        jspmPackage: jspm.packageDir
      },
      configFiles: {
        jspm: 'jspm.config.js'
      }
    }, jspm.config || {}), ['directories', 'configFiles']);
  }

  var config = rootNotFound ? {} : merge.all([
  // defaults
  conform({
    directories: {},
    entries: [],
    cache: '.systemjs.cache.json',
    watch: true,
    log: 'smart',
    lazy: true,
    serve: {
      dir: '.',
      port: 3000,
      handler: function handler(_ref) {
        var defaultHandler = _ref.handlers.defaultHandler;
        return defaultHandler();
      },
      finalHandler: function finalHandler(_ref2) {
        var defaultFinalHandler = _ref2.handlers.defaultFinalHandler;
        return defaultFinalHandler();
      },
      keys: defaultKeys
    },
    channel: {
      port: 7777,
      keys: defaultKeys
    },
    builder: {
      configFiles: [],
      options: {
        sourceMaps: 'inline',
        production: false
      }
    }
  }), conform(jspm.config),
  // static config
  conform(rootConfig),
  //overrides
  conform(configOverides)]);

  if (!rootNotFound) {
    config.directories.baseURL = config.directories.baseURL || config.serve.dir;
    config.channel.keys = config.channel.keys || config.serve.keys;
  }

  if (typeof config.log == 'string') {
    config.log = {
      'smart': function smart(_ref3) {
        var type = _ref3.type,
            relativePath = _ref3.relativePath,
            message = _ref3.message;


        switch (type) {
          case 'file-changed':
            {
              return false;
            }
          case 'log':
            {
              if (message == 'persisting cache') return false;

              break;
            }
        }

        return true;
      },
      '*': function _() {
        return true;
      },
      'none': function none() {
        return false;
      }
    }[config.log];
  }

  return {
    config: config,
    errors: [rootNotFound ? ':: exiting :: couldn\'t find a valid systemjs-tools config' : null].filter(function (notNull) {
      return notNull;
    }),
    valid: !rootNotFound
  };
};