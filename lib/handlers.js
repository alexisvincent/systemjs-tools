/**
 * Created by alexisvincent on 2016/09/04.
 */
const path = require('path')
export const testHandler = tools => (req, res, next) => {

}

export const pushDeps = tools => (req, res, next) => {
    if (req.originalUrl.endsWith('app.js'))
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
                                    accept: '*/*'
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
    else
        next()
}


export const bundleEntry = tools => (req, res, next) => {
    console.log('bundle-entry')
    tools._thenBuild(
        tools.builder.bundle(tools.entry, tools.builderConfig).then(m => {
            res.send(m.source)
        })
    )
}
export const bundleDeps = tools => (req, res, next) => {
    tools._thenBuild(
        tools.builder.bundle('app/app.js - [app/**/*]', tools.builderConfig).then(m => {
            res.end(m.source)
            next()
        })
    )
}
export const bundle = tools => (req, res, next) => {
    console.log('bundle')
    tools._thenBuild(
        tools.builder.bundle('app/app.js', tools.builderConfig).then(m => {
            res.send(m.source)
        })
    )
}

export const compile = tools => (req, res, next) => {
    console.log('compile')
    tools._thenBuild(
        tools.builder.compile(req.originalUrl, tools.builderConfig).then(m => {
            res.send(m.source)
        })
    )
}

export const skip = tools => (req, res, next) => {
    next()
}

