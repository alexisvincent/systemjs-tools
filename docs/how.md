# HOW? (not ready)
`systemjs-tools` ships in 3 pieces, a `client library`, a `server
library` and a `cli`. These are all provided in the npm package
`systemjs-tools`.

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

### Config (NOT ACTUAL CONFIG)

```
    // key directories (superset of jspm.directories)
    // if a jspm key exists in the package.json at the project root
    // the directories will be used as defaults
    directories: {
        // Absolute path the project root, discovered as explained above
        // All other paths are specified relative to the root
        root: process.cwd()

        // path to directory mapping to the systemjs baseURL
        baseURL: '.'
    }

    // A list of entries to your application [optional]
    // This is simply used to premptively cache files you might load to speed up the first load
    entries: ['app/app.js'],

    serve: {}
```

### Client (not yet working in new implementation)
`systemjs-tools` relies on socket.io-client being available. We don't specify this as a peer dep since this causes issues
with `JSPM` / `npm` interop.

**Install** via
`npm install systemjs-tools socket.io-client`
or `yarn add systemjs-tools socket.io-client`
or `jspm install npm:systemjs-tools socket.io-client`

At the top of your root client file
```javascript
import { client } from 'systemjs-tools'

connect({
    // Port used to connect to server (defaults to 1337)
    port: 2345
})

```



