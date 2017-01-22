'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var passiveInit = exports.passiveInit = function passiveInit() {
  return {
    config: {
      protocol: 'https://',
      port: 7777,
      hostname: window.location.hostname
    },
    connect: function connect() {}
  };
};

var connect = exports.connect = function connect() {
  return passiveInit();
};