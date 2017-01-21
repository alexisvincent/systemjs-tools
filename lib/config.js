const path = require('path')
const merge = require('deepmerge')
const fs = require('fs')
const defaultKeys = require('spdy-keys')
const l = require('lodash')

/**
 * Recursively looks upwards for a directory containing one of (in order)
 * 1. systemjs.json
 * 2. package.json with systemjs key
 * @param dir
 * @returns {*}
 */
export const findRoot = (dir = process.cwd()) => {

  // Convert string dirs into a list of dir entries
  if (typeof dir === 'string')
    dir = dir.split(path.sep).filter(dir => dir != '')

  // Return with error if we have exhausted all dirs and not found a root
  if (dir.length == 0) return {rootNotFound: true}

  const configs = {}

  // Attempt to load the config files
  try {
    configs.file = require(path.join('/', ...dir, 'systemjs-tools.js')).config
  } catch (e) {
  }
  try {
    configs.pjson = require(path.join('/', ...dir, 'package.json'))['systemjs-tools']
  } catch (e) {
  }

  const config = configs.file || configs.pjson

  return config ? // if a systemjs-tools.js file or pjson.systemjs-tools key exists we've found root
    {
      rootConfig: merge({ // merge default root in with config
        directories: {
          root: path.join('/', ...dir)
        }
      }, config)
    } : findRoot(dir.splice(0, dir.length - 1)) // Otherwise look in the parent directory
}

// TODO: Make this function return a copy of config instead of mutating it
export const conform = (config) => {
  Object.keys(config).forEach(key => {
    if (config[key] === null || config[key] == undefined)
      delete config[key];
    else if (typeof config[key] === 'object')
      conform(config[key]);
  })

  return config
}

/**
 * Get the static config for systemjs-tools
 * @param configOverides
 * @returns {{config: {}, errors: (Iterable<K, V>|Array.<*>), valid: boolean}}
 */
export const getConfig = (configOverides) => {
  const {rootConfig, rootNotFound} = findRoot()

  const jspm = {}

  if (!rootNotFound) {
    // Grab the package directory
    jspm.packageDir = rootConfig.directories && rootConfig.directories.jspmPackage || '.'

    try {
      jspm.config = require(path.join(rootConfig.directories.root, jspmPackageDir, 'package.json'))
    } catch (e) {
    }

    jspm.config = l.pick(merge({
      directories: {
        jspmPackage: jspm.packageDir
      },
      configFiles: {
        jspm: 'jspm.config.js',
      }
    }, jspm.config || {}), ['directories', 'configFiles'])
  }

  const config = rootNotFound ? {} : merge.all([
      // defaults
      conform({
        directories: {},
        entries: [],
        cache: '.systemjs.cache.json',
        watch: true,
        lazy: false,
        serve: {
          dir: '.',
          port: 3000,
          handler: ({handlers: {defaultHandler}}) => defaultHandler(),
          finalHandler: ({handlers: {defaultFinalHandler}}) => defaultFinalHandler(),
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
      }),
      conform(jspm.config),
      // static config
      conform(rootConfig),
      //overrides
      conform(configOverides)
    ])

  if (!rootNotFound) {
    config.directories.baseURL = config.directories.baseURL || config.serve.dir
    config.channel.keys = config.channel.keys || config.serve.keys
  }

  return {
    config,
    errors: [
      rootNotFound ? `:: exiting :: couldn't find a valid systemjs-tools config` : null
    ].filter(notNull => notNull),
    valid: !rootNotFound
  }
}