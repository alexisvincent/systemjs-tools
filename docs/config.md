# Config (WIP)

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

        /**
         * A list of optional directories to ignore in file watching
         *
         * default: []
         */
        ignored: [string]
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
        options: {},
    },

    /**
     * Optional mappings for customizing bundling.
     */
    mappings: [{

      /**
       * A matching rule, either string mapped to end of request URL, a function passed
       * the request returning a truthy value, or a regex
       */
      match: string|function|regex,

      /**
       * Builder object containing expression and options for this bundle to build
       */
      builder: {

         /**
          * Expression to build, including optional bundle arithmetic.
          */
         expression: string,

         /**
          * Options to merge with main builder options.
          */
         options: {}
      }
    }],

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
    },

    /**
     * To proxy to back-end resources your app may depend on during development
     * (for example, a REST endpoint), you can use the proxy configuration.
     *
     * example: proxy: 'http://localhost:8182'
     */
    proxy: string
}
```
