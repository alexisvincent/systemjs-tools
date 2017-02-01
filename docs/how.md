# HOW? (not ready)
`systemjs-tools` ships in 3 pieces, a `client library`, a `server
library` and a `cli`. These are all provided in the npm package
`systemjs-tools`.

1. [CLI](#cli)
2. [Server](#server)
3. [Client](#client)

### General Usage
`systemjs-tools` (cli and server) upon initialization, searches upwards for
a `project root directory` (indicated by a `systemjs-tools.js` file or a `systemjs-tools`
key in your `package.json`). It then loads the relevant [config](#config),
describing your environment (eg. baseURL directory and port to serve on).

If you do not already have a config file, navigate to the directory containing
your frontend source files and run `systemjs init` **(not ready yet)**,
to create a config describing your project.

Typically one would then run a command such as `systemjs serve`, to start
up a development server.

### CLI
#### Install
```npm install --global systemjs-tools```
or
```yarn global add systemjs-tools```

#### Usage
The `cli` is a thin wrapper over the `server lib` and as such, everything
you can do in the cli, you can also do (and more) in the `server lib`.

Once installed, the `cli` is then available via the `systemjs` command.
To view available commands and usage, run `systemjs --help` (the output
of which has been included below).

```
  Usage: systemjs [options] [command]

  Commands:
    generate-config       generate SystemJS config from node_modules (using systemjs-config-builder)
    serve [options]       Serve the current directory
    new [options] <name>  Generate a minimal boilerplate for getting up and running quickly

  Options:
    -h, --help  output usage information
```

### Server
#### Install
```npm install systemjs-tools``` or ```yarn add systemjs-tools```

#### Usage
```javascript

/**
 * systemjs-tools exposes the init function which accepts as an
 * argument, an override config object, and returns a static tools
 * object representing your environment.

const { init } = require('systemjs-tools');

// initialize systemjs-tools
const tools = init({ /** your config overrides **/ })

// do some stuff
tools.serve()
```

##### tools.serve
```js
/**
 * HTTP2 server behaving as specified in config.serve
 *
 * accepts as argument, an override object for config.serve
 */
 tools.serve({ port: 8000 })
```


### Config

The config object describes to `systemjs-tools` how your environment is
structured and can be loaded in a number of ways.

At initialization, `systemjs-tools` looks for

a `systemjs-tools.js` file
```js
module.exports.config = { ... }
```

or a `package.json` file containing a `systemjs-tools` key
```js
{
  "name": "my-awesome-project",
  "dependencies": { ... },
  "systemjs-tools": { ... }
}
```

The config objects found in either of these two places override the defaults.

Additionally when initialising `systemjs-tools` via the server lib
```js
const { init } = require('systemjs-tools')

init({ /** config options specified here override the config files **/ })
```

The config object is of the form:

```javascript
const config = {

    /**
     * An object specifying key directory locations (superset of jspm.directories)
     * all directories are relative to config.directories.root
     *
     * if your project uses JSPM, and directories.jspm points to your
     * JSPM package root, the keys specified in jspm.directories in your
     * package.json will be used as defaults
     */
    directories: {

        /**
         * Absolute path the project root, all other paths are specified
         * relative to the root
         *
         * default: location of system-tools.js or package.json
         *          containing systemjs-tools key
         */
        root: string,

        /**
         * Path to directory mapping to the systemjs baseURL
         *
         * default: defaults to config.serve.dir
         */
        baseURL: string,
    },

    /**
     * A list of entries to your application, used to premptively cache
     * module entries and for HMR
     *
     * default: []
     */
    entries: [string],

    /**
     * Location of persistent cache file relative to config.directories.root
     *
     * default: '.systemjs.cache.json',
     */
    cache: string,

    /**
     * Should systemjs-tools start a file watcher @ config.directories.root
     *
     * default: true
     */
    watch: bool,

    /**
     * DEPRECATED: will be replaced by debug lib
     *
     * Specifies what systemjs-tools should log
     * one of [ 'smart', '*', 'none'] or a function (event) => bool
     *
     * default: 'smart'
     */
    log: string,

    /**
     * Should the system preemptively bundle, or lazy
     * load (bundle on request) the entries.
     *
     * { lazy: false } is mostly unusable at the moment until the builder
     * supports cancellable builds and systemjs-tools spawns the builder
     * in it's own thread
     *
     * default: true
     */
    lazy: bool,

    /**
     * options related to the builder instance
     */
    builder: {

        /**
         * SystemJS config files to load (in order) into the builder instance
         *
         * default: []
         */
        configFiles: [string],

        /**
         * options to pass to the builder instance (described in systemjs-builder)
         *
         * default: { sourceMaps: 'inline', production: false }
         */
        options: {}
    }

    /**
     * options for systemjs-tools' convenience HTTP2 server
     */
    serve: {

        /**
         * The directory systemjs-tools should statically serve (relative
         * to config.directories.root), this also acts as the default
         * value for config.directories.baseURL
         *
         * default: '.'
         */
        dir: string,

        /**
         * The port to serve on
         *
         * default: 3000
         */
        port: int,

        /**
         * Allows you to supply your own HTTP handler function to the
         * server. The function you supply must accept an instance of
         * systemjs-tools and return a standard HTTP request handler,
         * in other words, a function accepting (req, res).
         *
         * As a convinience, we expose a set of helper handlers on the
         * systemjs-tools instance at tools.handlers, which you can use
         * when composing your own custom handler.
         *
         * For more information about these custom handlers, see the server
         * API docs.
         *
         * default: ({handlers: {defaultHandler}}) => defaultHandler(),
         */
        handler: (tools) => handler

        /**
         * Certificates that will be passed to the HTTP2 server, exactly
         * as you would with the normal HTTPS node API
         *
         * default: uses the keys exposed by the spdy-keys package
         */
        keys: {
            key:  [byte]
            cert: [byte]
        }
    },

    /**
     * To facilitate features like HMR and in browser error catching,
     * the systemjs-tools server lib needs to be able to communicate with
     * the browser. We acheive this through a websocket (via socket.io),
     * and call the exposed socket the systemjs-tools channel
     */
    channel: {
        /**
         * Port to run the channel on
         *
         * default: 7777
         */
        port: int,

        /**
         * Certificates that will be passed to the HTTP2 server (backing
         * the websocket connection), exactly as you would with the normal
         * HTTPS node API
         *
         * default: uses the keys exposed by the spdy-keys package
         */
        keys: defaultKeys
    }
}
```

### Client (a bit cluncky, but will be improved)
#### Prerequisites

`systemjs-tools` relies on socket.io-client being available. We don't specify this as a peer dep since this causes issues with `JSPM` / `npm` interop.

`systemjs-tools` also relies on the System.reload polyfill, available via `systemjs-hmr`.

#### Install
npm: `npm install systemjs-tools systemjs-hmr socket.io-client`

yarn: `yarn add systemjs-tools systemjs-hmr socket.io-client`

jspm `jspm install npm:systemjs-tools npm:systemjs-hmr socket.io-client`

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

