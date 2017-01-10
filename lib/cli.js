#! /usr/bin/env node
const fs = require('mz/fs')
const Promise = require('bluebird')
const cli = require('commander')
const express = require('express')
const path = require('path')
const ncp = require('ncp').ncp;
const {init } = require('./index.js')

import {
  traceModuleTree,
  augmentModuleTree,
  pruneModuleTree,
  generateConfig,
  serializeConfig,
  toCache,
  fromCache
} from 'systemjs-config-builder'

cli
  .command('generate-config')
  .description('generate SystemJS config from node_modules (using systemjs-config-builder)')
  .action(() => {

    const {_: {cache}} = init()

    traceModuleTree('.')
      .then(fromCache(() => Promise.resolve(cache.configBuilder = cache.configBuilder || {})))
      .then(augmentModuleTree)
      .then(toCache(registry => Promise.resolve(cache.configBuilder = registry)))
      .then(pruneModuleTree)
      .then(generateConfig)
      .then(serializeConfig)
      .then(fs.writeFile.bind(null, './generated.config.js'))
  })

cli
  .command('serve')
  .description('Serve the current directory')
  .option('--hmr', 'Should we enable hmr')
  .option('-p, --port [port]', 'port to serve on [3000]', parseInt)
  .option('-d, --dir [dir]', 'relative path to directory to serve',
    (dir) => path.join(process.cwd(), dir))

  .action((opts) => {

    // Construct tools instance from config
    const {serve} = init({
      serve: {
        port: opts.port,
        // dir: opts.dir,
        // hmr: opts.hmr
      }
    })

    // TODO: Check for errors in init

    serve()

  })

cli
  .command('init <name>')
  .option('--docker', 'Add Dockerfile and docker-compose.yml')
  .description('Generate a minimal boilerplate for getting up and running quickly')
  .action((name, opts) => {
    ncp(
      path.join(__dirname, '../boilerplate/base'),
      path.join(process.cwd(), name),
      (err) => {
        if (err) console.error(err)
        else {
          console.log('generated base boilerplate')

          if (opts.docker)
            ncp(
              path.join(__dirname, '../boilerplate/docker'),
              path.join(process.cwd(), name),
              {clobber: false},
              (err) => err ? console.error(err) : console.log('added docker compat'));
        }
      });
  })

// cli
//   .command('_')
//   .description('For internal testing. You should not see this. If you do, I forgot to comment it :/')
//   .action((name, opts) => {
//     console.log(getConfig({}))
//   })

cli.parse(process.argv)
