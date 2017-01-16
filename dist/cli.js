#! /usr/bin/env node
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _systemjsConfigBuilder = require('systemjs-config-builder');

var fs = require('mz/fs');
var Promise = require('bluebird');
var cli = require('commander');
var express = require('express');
var path = require('path');
var ncp = require('ncp').ncp;

var _require = require('./index.js'),
    init = _require.init;

var _require2 = require('./config.js'),
    getConfig = _require2.getConfig;

cli.command('generate-config').description('generate SystemJS config from node_modules (using systemjs-config-builder)').action(function () {
  var _init = init(),
      cache = _init._.cache;

  (0, _systemjsConfigBuilder.traceModuleTree)('.').then((0, _systemjsConfigBuilder.fromCache)(function () {
    return Promise.resolve(cache.configBuilder = cache.configBuilder || {});
  })).then(_systemjsConfigBuilder.augmentModuleTree).then((0, _systemjsConfigBuilder.toCache)(function (registry) {
    return Promise.resolve(cache.configBuilder = registry);
  })).then(_systemjsConfigBuilder.pruneModuleTree).then(_systemjsConfigBuilder.generateConfig).then(_systemjsConfigBuilder.serializeConfig).then(fs.writeFile.bind(null, './generated.config.js'));
});

cli.command('serve').description('Serve the current directory').option('--hmr', 'Should we enable hmr').option('-p, --port [port]', 'port to serve on [3000]', parseInt).option('-d, --dir [dir]', 'relative path to directory to serve', function (dir) {
  return path.join(process.cwd(), dir);
}).action(function (opts) {

  // Construct tools instance from config
  var _init2 = init({
    serve: {
      port: opts.port
    }
  }),
      serve = _init2.serve;

  // TODO: Check for errors in init

  serve();
});

var boilerplateLayers = [['react', 'React Hello World'], ['docker', 'Add Dockerfile and docker-compose.yml']];

var generateBoilerplate = cli.command('new <name>').description('Generate a minimal boilerplate for getting up and running quickly');

boilerplateLayers.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      name = _ref2[0],
      description = _ref2[1];

  return generateBoilerplate = generateBoilerplate.option('--' + name, description);
});

generateBoilerplate.action(function (name, opts) {
  ncp(path.join(__dirname, '../boilerplate/base'), path.join(process.cwd(), name), function (err) {
    if (err) console.error(err);else {
      console.log('generated base boilerplate');

      boilerplateLayers.forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            n = _ref4[0],
            _ = _ref4[1];

        if (opts[n]) ncp(path.join(__dirname, '../boilerplate/' + n), path.join(process.cwd(), name),
        // {clobber: false},
        function (err) {
          return err ? console.error(err) : console.log('added ' + n + ' layer');
        });
      });
    }
  });
});

cli.command('_').description('For internal testing. You should not see this. If you do, I forgot to comment it :/').action(function (name, opts) {
  console.log(getConfig({}));
});

cli.parse(process.argv);