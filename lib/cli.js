#! /usr/bin/env node
const fs = require('graceful-fs')
const Promise = require('bluebird')
const cli = require('commander')
const spdy = require('spdy')
const express = require('express')
const path = require('path')
const {key, cert, ca} = require('spdy-keys')
const ncp = require('ncp').ncp;

import {
  traceModuleTree,
  augmentModuleTree,
  pruneModuleTree,
  generateConfig,
  serializeConfig,
  toCache,
  fromCache
} from 'systemjs-config-builder'

const pfs = {}

/**
 * Promisify all fs functions
 */
Object.keys(fs).map(key => {
  if (typeof fs[key] == 'function')
    pfs[key] = Promise.promisify(fs[key]);
})

cli
  .command('generate-config')
  .description('generate SystemJS config from node_modules (using systemjs-config-builder)')
  .action(() => {
    traceModuleTree('.')
      .then(fromCache)
      .then(augmentModuleTree)
      .then(toCache)
      .then(pruneModuleTree)
      .then(generateConfig)
      .then(serializeConfig)
      .then(pfs.writeFile.bind(null, './generated.config.js'))
  })

cli
  .command('serve')
  .description('Serve the current directory')
  .option('-p, --port [port]', 'The port to serve on [433]', '433')
  .action(({port}) => {
    port = Number(port)

    const app = express()
// const tools = make({
//   packagePath: path.join(process.cwd(), './app'),
//
//   hmr: true,

    // entries: ['index.js'],

    // resolveHandler: ({req, initiatedBySystemJS, resolvers, tools}) => {
    //   const {bundle, next} = resolvers
    //
    //   return req.originalUrl.endsWith("dependencies.js")
    //     ? bundle({expression: 'app'})
    //     : next()
    // },

    // builderConfig: {
    //   sourceMaps: false
    // }
// })

// app.use("*", tools.handler)
    console.log(process.cwd())

    app.use(express.static(process.cwd()))

    spdy.createServer({key, cert, ca}, app)
      .listen(port, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          console.log('Listening on port: ' + port + '.')
        }
      })

  })

cli
  .command('init <name>')
  .description('Generate a minimal boilerplate for getting up and running quickly')
  .action((name) => {
    ncp(
      path.join(__dirname, '../boilerplate'),
      path.join(process.cwd(), name),
      (err) => err ? console.error(err) : console.log('Successfully Generated!'));
  })

cli.parse(process.argv)
