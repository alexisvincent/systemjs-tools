/**
 * Created by alexisvincent on 2016/09/03.
 */
const express = require('express')
const spdy = require('spdy')
// const spdy = require('spdy-push')
const compression = require('compression')
const jspm = require('jspm')
const socketio = require('socket.io')
const fs = require('fs')

const app = express()

const server = spdy.createServer(require('spdy-keys'), app)

app.use(compression());

const {make} = require('../dist/index');

const devtools = make({
    packagePath: process.cwd(),
    jspm: jspm,
    hmr: true,
    io: socketio(server),
    entries: ['app/app.js'],
    resolveHandler: ({tools, req, initiatedBySystemJS, resolvers}) => {
        const {bundle, compile, next} = resolvers
        return req.originalUrl.endsWith("dependencies.js")
            ? bundle({expression: tools.entries[0]})
            : next()
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
server.listen(3000, err => console.log(err ? err : `Listening at https://localhost:3000`))
