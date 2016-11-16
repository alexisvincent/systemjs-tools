#! /usr/bin/env node
import fs from 'graceful-fs'
import Promise from 'bluebird'

import {
    traceModuleTree,
    augmentModuleTree,
    pruneModuleTree,
    generateConfig,
    serializeConfig
} from 'systemjs-config-builder'

const pfs = {}

/**
 * Promisify all fs functions
 */
Object.keys(fs).map(key => {
    if (typeof fs[key] == 'function')
        pfs[key] = Promise.promisify(fs[key]);
})


const config = () => {
    return traceModuleTree(dir)
        .then(augmentModuleTree)
        .then(pruneModuleTree)
        .then(generateConfig)
        .then(serializeConfig)
        .then(pfs.writeFile.bind(null, './generated.config.js'))
}

if (process.argv[1] == 'config') config()
else console.log('At the moment all that SystemJS Tools does is generate a config from node_modules. \n Usage: systemjs config')