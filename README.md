# JSPM Devtools [UNSTABLE!!!]

API is in heavy flux, will settle over the next few days/weeks

```js
const devtools = require('jspm-devtools').default({
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
    bundleHandler: ({req, isSystemJSRequest}) => {
        return req.originalUrl.endsWith("dependencies.js") ? 'bundle'
            : 'skip'
    }
})

/**
 * Delegate to devtools handler as first point of entry
 */
app.use("*", devtools.handler)
```