'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = exports.passiveInit = undefined;

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import 'systemjs-hmr/next'
var tools = {
  _: {
    initialized: false
  },
  config: {
    protocol: 'https://',
    port: 7777,
    hostname: window.location.hostname
  }
};
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'
var passiveInit = exports.passiveInit = function passiveInit() {
  var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!tools._.initialized) {
    (function () {
      tools._.initialized = true;

      tools.config = (0, _deepmerge2.default)(tools.config, c);

      var _ = tools._,
          config = tools.config;


      tools.connect = function () {
        var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var _merge = (0, _deepmerge2.default)(config, configOverride),
            protocol = _merge.protocol,
            port = _merge.port,
            hostname = _merge.hostname;

        if (!_.socket) {
          _.socket = (0, _socket2.default)(protocol + hostname + ":" + port, { secure: true });

          _.socket.on('connect', function () {
            return _.socket.emit('identification', navigator.userAgent);
          });
          _.socket.on('reload', function () {
            return document.location.reload(true);
          });
          _.socket.on('*', function (event) {
            switch (event.type) {
              case 'hmr':
                {
                  var url = event.url,
                      entries = event.entries;

                  var URL = SystemJS.baseURL + url;
                  System.reload(URL, { entries: entries }).then(function (x) {
                    // console.log(`${URL} changed`, x)
                  });
                  break;
                }
            }
          });
        }
      };
      // state.
    })();
  }
  return tools;
};

var connect = exports.connect = function connect() {
  var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var tools = passiveInit(configOverride);
  tools.connect();
  return tools;
};