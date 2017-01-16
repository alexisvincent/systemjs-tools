'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = exports.passiveInit = undefined;

require('systemjs-hmr/dist/next.js');

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tools = {
  _: {
    initialized: false
  },
  config: {
    protocol: window.location.protocol,
    port: window.location.port,
    host: window.location.hostname
  }
};
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'
var passiveInit = exports.passiveInit = function passiveInit(config) {
  if (!tools.initialized) {
    (function () {

      tools.initialized = true;
      tools.config = (0, _deepmerge2.default)(tools.config, config);

      var _ = tools._,
          config = tools.config;


      tools.connect = function (configOverride) {
        var _merge = (0, _deepmerge2.default)(config, configOverride),
            protocol = _merge.protocol,
            port = _merge.port,
            host = _merge.host;

        if (!_.socket) {
          _.socket = (0, _socket2.default)(protocol + host + ":" + port);

          _.socket.on('connect', function () {
            return socket.emit('identification', navigator.userAgent);
          });
          _.socket.on('reload', function () {
            return document.location.reload(true);
          });
          _.socket.on('change', function (_ref) {
            var path = _ref.path,
                entries = _ref.entries;
            return System.reload(path, { roots: entries });
          });
        }
      };
      // state.
    })();
  }
  return tools;
};

var connect = exports.connect = function connect(config) {
  var tools = passiveInit(config);
  tools.connect();
  return tools;
};