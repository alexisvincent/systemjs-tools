# HOW? (not ready)
`systemjs-tools` ships in 3 pieces, a `client library`, a `server
library` and a `cli`. These are all provided in the npm package
`systemjs-tools`.

1. [CLI](#cli)
2. [Server](#server)
3. [Client](#client)

### CLI
The `cli` is a thin wrapper over the `server lib` and as such, everything
you can do in the cli, you can also do (and more) in the `server lib`.

**Install** via
`npm install --global systemjs-tools` or `yarn global add systemjs-tools`

The `cli` is then available via the `systemjs` command. To view available
commands and usage, run `systemjs --help` (the output of which has been
included below).

      Usage: systemjs [options] [command]

      Commands:

        serve [options]        Serve the current directory
        generate-config        generate SystemJS config from node_modules (using systemjs-config-builder)
        new [options] <name>   Generate a minimal boilerplate for getting up and running quickly

      Options:

        -h, --help  output usage information

### Server
**Install** via
`npm install systemjs-tools` or `yarn add systemjs-tools`

`systemjs-tools` exposes a single function `init` which accepts as an
argument, a config object, and returns a static `tools` object representing your
environment. Upon execution, `init` recursively searches upwards for the
`root` of the project (indicated by either a `"systemjs"` key in your
`package.json` or a `systemjs.js` file), it then configures itself from
the discovered configs and your provided config overrides. The returned
tools object is static (no running processes) and it is safe to run init
multiple times. The `tools` object exposes properties and functions tailored
to your environment.

Below is a brief fly through of some of the things you can do with the
api. Fo a more in-depth look, checkout the server API docs, or the examples.
```javascript

// import init function
const { init } = require('systemjs-tools');

// initialize systemjs-tools
const tools = init({ /** your config overrides **/ })

// use one of the exported properties
const { config, serve, analyse, handlers, _ } = tools

// including one of the express request handlers
const { bundle, compile, serverPush, defaultHandler} = handlers

// or the analyse function
const { initiatedBySystemJS } = analyse(req, res)

// maybe start an http server
serve({port: 8000})

// or your own express server
const app = express()
app.use(handlers.defaultHandler)
http.createServer( app )

// use your own file watcher
myCustomWatcher.on('change', file) => _.fileChanged(file))

// or hook into the builder
_.builder

// listen on system events
_.events.subscribe( event => console.log(event) )

// bundle your app
_.bundle('app.js').then( m => console.log(m.source))
```

### Config (not definitive, somethings may have changed)

```javascript
module.exports.config = {

    // key directories (superset of jspm.directories)
    // if a jspm key exists in the package.json at the project root
    // the directories will be used as defaults
    directories: {

        // Absolute path the project root, discovered as explained above
        // All other paths are specified relative to the root
        root: process.cwd()

        // path to directory mapping to the systemjs baseURL
        baseURL: '.'
    },

    // A list of entries to your application [optional]
    // This is simply used to premptively cache files you might load to speed up the first load
    entries: ['app/app.js'],

    // location of cache file relative to directories.root
    cache: '.systemjs.cache.json',

    // Should systemjs-tools start a file watcher and bust files itself
    watch: true,

    // one of [ 'smart', '*', 'none'] or a function (event) => bool
    // will probably soon be replaced with debug library
    log: 'smart',

    // should the system preemptively bundle/compile the entries
    // { lazy: false } is mostly unusable at the moment until the builder
    // as been extended
    lazy: true,

    // options related to the http file server
    serve: {

        // which directory should systemjs-serve static files from
        dir: '.',

        // which port should we serve on
        port: 3000,

        /**
         * custom request handler factory
         * f: (systemjs-tools instance) => standard http request handler
         * You also have access to a set of handlers we expose on
         * tools.handlers, for more information about these handlers ...
         */
        handler: ({handlers: {defaultHandler}}) => defaultHandler(),

        // certificates that will be passed in to http2 server
        keys: {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem')
        }
    },

    // http2 development channel (to communicate with client)
    channel: {
        // port on which the channel runs
        port: 7777,

        // certificates that will be used to start the http2 dev channel
        keys: defaultKeys
    },

    // options related to the builder instance
    builder: {

        // SystemJS config files to load (in order) into the builder instance
        configFiles: ['./jspm.config.js'],

        // options to pass to the builder instance (described in systemjs-builder)
        options: {
          sourceMaps: 'inline',
          production: false
        }
    }
}
```

### Client (a bit cluncky, but will be improved)
#### Prerequisites

`systemjs-tools` relies on socket.io-client being available. We don't specify this as a peer dep since this causes issues with `JSPM` / `npm` interop.

`systemjs-tools` also relies on the System.reload polyfill, available via `systemjs-hmr`.

#### Install

`npm install systemjs-tools systemjs-hmr socket.io-client`
or `yarn add systemjs-tools systemjs-hmr socket.io-client`
or `jspm install npm:systemjs-tools npm:systemjs-hmr socket.io-client`

#### Usage

In your index file
```html
<script>
Promise.all([
    System.import('systemjs-hmr'),
    System.import('systemjs-tools/client')
]).then(([_, {connect}]) => {
    connect()
    System.import('app.js')
})
</script>
```

