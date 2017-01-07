#! /usr/bin/env node
const fs = require('graceful-fs')
const Promise = require('bluebird')
const cli = require('commander')
const spdy = require('spdy')
const express = require('express')
const path = require('path')
const {key, cert, ca} = require('spdy-keys')
const ncp = require('ncp').ncp;
const findRoot = require('find-root')
const {make} = require('./index.js')


import {
  traceModuleTree,
  augmentModuleTree,
  pruneModuleTree,
  generateConfig,
  serializeConfig,
  toCache,
  fromCache
} from 'systemjs-config-builder'

const proot = findRoot(process.cwd())
const pjson = require(path.join(proot, 'package.json'))

const config = {
  serve: {},
  ...(pjson.systemjs || {}),
}

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
  .option('-p, --port [port]', 'port to serve on [3000]', parseInt, config.serve.port || 3000)
  .option('-d, --dir [dir]', 'relative path to directory to serve',
    (dir) => path.join(process.cwd(), dir),
    config.serve.dir ? path.join(proot, config.serve.dir) : process.cwd())

  .action((opts) => {

    const app = express()

    const tools = make({
      packagePath: proot,

      hmr: true,

      // Should be able to get the package to sort this out
      entries: config.entries || [],

      resolveHandler: ({req, initiatedBySystemJS, resolvers, tools}) => {
        const {bundle, next} = resolvers

        return req.originalUrl.endsWith("dependencies.js")
          ? bundle({expression: 'app'})
          : next()
      },

      // builderConfig: {
      //   sourceMaps: true
      // }
    })

    app.use("*", tools.handler)
    app.use(express.static(opts.dir))

    spdy.createServer({key, cert, ca}, app)
      .listen(opts.port, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          console.log('Serving ' + opts.dir + ' at https://127.0.0.1:' + opts.port)
        }
      })

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

cli.parse(process.argv)
