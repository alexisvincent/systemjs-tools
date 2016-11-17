#! /usr/bin/env node
import fs from 'graceful-fs'
import Promise from 'bluebird'
import {spawn} from 'child_process'


import {
    traceModuleTree,
    augmentModuleTree,
    pruneModuleTree,
    generateConfig,
    serializeConfig,
    toCache,
    fromCache,
    nodeCoreModules
} from 'systemjs-config-builder'

const pfs = {}

/**
 * Promisify all fs functions
 */
Object.keys(fs).map(key => {
    if (typeof fs[key] == 'function')
        pfs[key] = Promise.promisify(fs[key]);
})

const install_core_libs = () => {
    spawn(
        'jspm',
        ['install',
            ...nodeCoreModules
                .filter(lib => lib.lastIndexOf('sys') == -1)
                .map(lib => lib + "=npm:jspm-nodelibs-" + lib)],
        {stdio: 'inherit'});
}

const config = () => {
    return traceModuleTree('.')
        .then(fromCache)
        .then(augmentModuleTree)
        .then(toCache)
        .then(pruneModuleTree)
        .then(generateConfig)
        .then(serializeConfig)
        .then(pfs.writeFile.bind(null, './generated.config.js'))
}

const usage = () => {
    console.log(
        'Usage:', '\n',
        '\n',
        '  ', 'config', '-', 'generate SystemJS config from node_modules (using systemjs-config-builder)', '\n',
        '  ', 'core-libs', '-', 'jspm install [core-libs] (for use with systemjs-config-builder)'
    )
}

if(process.argv.length > 2) {
    switch (process.argv[2]) {
        case 'config':
            config()
            break;
        case 'core-libs':
            install_core_libs()
            break;
        default:
            usage()
    }
} else usage()
