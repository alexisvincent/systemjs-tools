# JSPM Devtools [UNSTABLE!!!]

API is in heavy flux, will settle over the next few days/weeks

```js
const { make } = require('jspm-devtools');

const devtools = make({
    // Absolute path to package.json
    serverRoot: process.cwd(),
    // Instance of jspm used in project
    jspm: jspm,
    // Instance of socket.io (for hmr) [optional]
    io: socketio(server),
    // Use this to preemptively bundle [optional]
    entry: 'app/app.js',
    // Hot Module Replacement [defaults to false]
    hmr: true,
    // Function that decides how to handle requests
    resolveHandler: ({req, isSystemJSRequest, resolvers}) => {
        const {bundle, next} = resolvers
        return req.originalUrl.endsWith("dependencies.js")
            ? bundle()
            : next()
    }
})

/**
 * Delegate to devtools handler as first point of entry
 */
app.use("*", devtools.handler)
```
