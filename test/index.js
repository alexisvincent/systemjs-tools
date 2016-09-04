/**
 * Created by alexisvincent on 2016/09/03.
 */
const express = require('express')
const spdy = require('spdy')
const compression = require('compression')
const jspm = require('jspm')
const socketio = require('socket.io')
const fs = require('fs')

const app = express()

const server = spdy.createServer({
    key: fs.readFileSync(__dirname + '/certs/server.key'),
    cert: fs.readFileSync(__dirname + '/certs/server.crt'),
}, app)

app.use(compression());

const devtools = require('../dist/index').default({
    serverRoot: process.cwd(),
    jspm: jspm,
    io: socketio(server),
    entry: 'app/app.js',
    hmr: true,
    bundleHandler: ({req, isSystemJSRequest}) => {
        return req.originalUrl.endsWith("dependencies.js") ? 'bundle'
            : 'skip'
            // return 'test'
        // return isSystemJSRequest ? 'bundle'
        //     : 'skip'
        // return isSystemJSRequest ? 'pushDeps' : 'skip'
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
