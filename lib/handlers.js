/**
 * Created by alexisvincent on 2016/09/04.
 */
const path = require('path')
// var spdy = require('spdy-push');


const pushDeps = ({tools}) => () => (req, res, next) => {
    tools._thenBuild(
        tools.builder.trace(req.originalUrl.slice(1)).then(trace => {
            return Promise.all(Object.keys(trace).map(depName => {
                return tools.jspm.normalize(depName).then(normalized => {
                    return tools.builder.compile(normalized).then(compiled => {
                        console.log('successfully compiled <>', path.relative(tools.serverRoot, trace[depName].path))
                        var stream = res.push('/' + path.relative(tools.serverRoot, trace[depName].path), {
                            status: 200, // optional
                            method: 'GET', // optional
                            request: {
                                accept: 'application/x-es-module, */*'
                            },
                            response: {
                                'content-type': 'application/javascript'
                            }
                        });
                        stream.on('error', function (e) {
                            console.log(e)
                        });
                        stream.end(compiled.source);

                        return Promise.resolve(depName)

                    }).catch((e) => {
                        console.error("Failed to compile ", depName, e)
                        return false
                    })
                })
            }))
        }).then(compiled => {
            tools.builder.compile('app/app.js').then((compiled) => res.end(compiled.source))
        })
    )
}

const bundle = ({tools}) => ({expression} = {}) => (req, res, next) => {
    const toBundle = expression || req.originalUrl.substring(1)
    console.log(':: Bundling ', toBundle)
    tools._thenBuild(
        tools.builder.bundle(toBundle, tools.builderConfig).then(m => {
            res.end(m.source)
            console.log(':: Finished Bundling ', toBundle)
        })
    )
}

const compile = ({tools}) => ({file} = {}) => (req, res, next) => {
    const toCompile = file || req.originalUrl.substring(1)
    console.log(':: Compiling ', toCompile)
    tools._thenBuild(
        tools.builder.compile(toCompile, tools.builderConfig).then(m => {
            res.end(m.source)
            console.log(':: Finished Compiling ', toCompile)
        })
    )
}

const next = ({tools}) => () => (req, res, next) => next()

export const handler = (tools) => (req, res, nextHandler) => {
    const accept = req.get('accept');
    const initiatedBySystemJS = accept && accept.indexOf('application/x-es-module') !== -1

    // const file = path.join(tools.serverRoot, req.path, req.originalUrl)

    const resolvers = {
        bundle: bundle({tools}),
        compile: compile({tools}),
        next: next({tools}),
        pushDeps: pushDeps({tools}),
    }

    tools.resolveHandler({tools, req, initiatedBySystemJS, resolvers})(req, res, nextHandler)
}
