'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// import 'systemjs-hmr/next'
// import Rx from 'rxjs/Rx'
// import {Observable as O} from 'rxjs/Observable'
console.log('production client');

var tools = {
  config: {
    protocol: 'https://',
    port: 7777,
    hostname: window.location.hostname
  }
};

var passiveInit = exports.passiveInit = function passiveInit() {
  var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!tools._.initialized) {

    tools.config = Object.assign({}, tools.config, c);

    tools.connect = function () {
      var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    };
    // state.
  }
  return tools;
};

var connect = exports.connect = function connect() {
  var configOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var tools = passiveInit(configOverride);
  tools.connect();
  return tools;
};