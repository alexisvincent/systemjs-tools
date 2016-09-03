/**
 * Created by alexisvincent on 2016/09/03.
 */
const express = require('express')
const http = require('http')
const compression = require('compression')
const jspm = require('jspm')
const socketio = require('socket.io')
const fs = require('fs')

const app = express()
const server = http.createServer(app)

app.use(compression());

const devtools = require('../dist/index').default(process.cwd(), {
    jspm: jspm,
    io: socketio(server),
    entry: 'app/app.js',
    hmr: true,
    bundleHandler: ({req, isSystemJSRequest}) => {
        // return req.originalUrl.endsWith("dependencies.js") ? 'bundleDeps'
        //     : isSystemJSRequest ? 'compile'
        //     : 'skip'
        return isSystemJSRequest ? 'bundle'
            : 'skip'
    }
})

/**
 * Delegate to devtools handler as first point of entry
 */
app.use("*", devtools.handler)

/**
 * Serve all static files that are requested
 */
app.use('/', express.static(__dirname + '/', {
    dotfiles: 'allow'
}))

/**
 * If no static file exists, then return the index
 */
app.get('*', (req, res) => {
    fs.readFile('./index.html', 'utf8', (err, data) => {
        if (err) throw err;
        res.send(data);
    })
});

/**
 * Listen on port 3000
 */
server.listen(3000, err => console.log(err ? err : `Listening at http://localhost:3000`))
