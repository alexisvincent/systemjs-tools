#! /usr/bin/env node
const fs = require('mz/fs')
const Promise = require('bluebird')
const cli = require('commander')
const express = require('express')
const path = require('path')
const ncp = require('ncp').ncp;
const {init, passiveInit} = require('./index.js')
const {getConfig} = require('./config.js')

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

    const {_: {cache}} = passiveInit()

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
  .description('Start a development server')
  // .option('--hmr', 'Should we enable hmr')
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

const boilerplateLayers = [
  ['react', 'React Hello World'],
  ['docker', 'Add Dockerfile and docker-compose.yml']
]

let generateBoilerplate = cli
  .command('new <name>')
  .description('Generate a minimal boilerplate for getting up and running quickly')

boilerplateLayers.forEach(([name, description]) => (generateBoilerplate = generateBoilerplate.option(`--${name}`, description)))

generateBoilerplate.action((name, opts) => {
    ncp(
      path.join(__dirname, '../boilerplate/base'),
      path.join(process.cwd(), name),
      (err) => {
        if (err) console.error(err)
        else {
          console.log('generated base boilerplate')

          boilerplateLayers.forEach(([n, _]) => {
            if (opts[n])
              ncp(
                path.join(__dirname, `../boilerplate/${n}`),
                path.join(process.cwd(), name),
                // {clobber: false},
                (err) => err ? console.error(err) : console.log(`added ${n} layer`));
          })
        }
      });
  })

cli
  .command('_')
  .description('For internal testing. You should not see this. If you do, I forgot to comment it :/')
  .action((name, opts) => {
    console.log(getConfig({}))
  })

cli.parse(process.argv)
