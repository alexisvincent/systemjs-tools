const path = require('path')
const merge = require('deepmerge')
const fs = require('fs')
const defaultKeys = require('spdy-keys')

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

  // The return object with the current directory we are searching
  const root = {
    root: path.join('/', ...dir)
  }

  // Attempt to load the config files
  try {
    root.sjson = require(path.join(root.root, 'systemjs.json'))
  } catch (e) {
  }
  try {
    root.pjson = require(path.join(root.root, 'package.json'))
  } catch (e) {
  }

  if (root.sjson) return root // Return root if we find a systemjs.json file
  else if (root.pjson && root.pjson.systemjs) return root // Otherwise return if there's a systemjs entry in the package.json
  else return findRoot(dir.splice(0, dir.length -1)) // Otherwise look in the parent directory
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
  const {root, pjson, sjson, rootNotFound} = findRoot()

  const config = rootNotFound ? {} : merge.all([
    // defaults
    conform({
      directories: {
        root,
        baseURL: "."
      },
      baseURL: '/',
      configFiles: {
        jspm: 'jspm.config.js'
      },
      entries: [],
      cache: '.systemjs.cache.json',
      watch: true,
      serve: {

        port: 4000,
        hmr: false,

        resolveHandler: ({req, initiatedBySystemJS, resolvers, tools}) => {
          const {bundle, next} = resolvers

          return req.originalUrl.endsWith("dependencies.js")
            ? bundle({expression: config.entries[0]})
            : next()
        },

        keys: defaultKeys
      },
      builder: {
        configFiles: [],
        config: {
          sourceMaps: 'inline'
        }
      }
    }),
    // Use package.json jspm.directories and jspm.configFiles if set
    conform({
      configFiles: {
        ...(pjson && pjson.jspm && pjson.jspm.configFiles || {})
      },
      directories: {
        ...(pjson && pjson.jspm && pjson.jspm.directories || {})
      }
    }),
    // static config
    conform(sjson || pjson.systemjs),
    //overrides
    conform(configOverides)
  ])

  return {
    config,
    errors: [
      rootNotFound ? `We couldn't find the systemjs-tools project root` : null
    ].filter(notNull => notNull),
    valid: !rootNotFound
  }
}