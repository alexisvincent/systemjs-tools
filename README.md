# SystemJS Tools
## [DISCLAIMER] These docs are part of a rewrite of the core engine (unpublished) check an older commit if you want the old docs.
`systemjs-tools` is a collection of powerful, customizable tools,
to help build compelling development and production stories for projects
that rely on `SystemJS`. Think [figwheel](https://github.com/bhauman/lein-figwheel)
or webpack, for SystemJS.

It exposes a `cli tool`, a `server-side library` and a `client
library`. Each exposes layered abstractions and hooks for you to describe
your unique environment, while still providing a largely automatic
experience at all levels.

## Roadmap (for reimplementation)
- [x] basic development bundling with file busting
- [x] cli - boilerplate generation
- [x] cli - config generation via systemjs-config-builder
- [x] cli - serve wrapper
- [x] promise construct for serialization of builder operations
- [x] rxjs core api (for plugin communication)
- [x] cross session generic cache with file busting
- [x] development mode
- [ ] production builds
- [ ] sourcemaps - [issue pending](https://github.com/systemjs/builder/issues/754)
- [ ] basic documentation
- [ ] hot module replacement
- [ ] hmr - preemptive sources
- [ ] development console with error catching
- [ ] handlers - [compile, static, bundle, http2 server push]
- [ ] configuration schema and validation
- [ ] cli - use config schema to automatically expose options
- [ ] generic dependency tree mapping for hmr of things that have their
      own dependency resolvers (eg. sass and pcss)

## Motivation
As 'modern' application developers, we have certain expectations from
our environment, namely

1. sub-second iteration cycles
2. hot module replacement
3. graceful error handling
4. clear development feedback
5. asset bundling
6. ...the list continues

Current development and production workflows for SystemJS leave much to
be desired. Projects end up clobbering together a haphazard subset of
their desired workflow and this contributes to developers leaving the
SystemJS ecosystem. That's ridiculous, SystemJS provides EXCELLENT
primitives to build seamless development workflows and we should be
leveraging that. `systemjs-tools` is my contribution towards tooling for
the SystemJS ecosystem, and I would encourage you, if you have the time,
to help contribute towards filling the gaps that exist in our ecosystem.

## Features
### Snappy Page Loading
SystemJS can take forever to load all modules into the browser,
this is because of the module compilation time and the latency induced by
the `[fetch file -> compile -> fetch dependencies -> compile ...]` cycle,
which can take over a minute in large projects.

To address this, `systemjs-tools` compiles all assets server side and
pushes all dependencies upfront to the browser, via either dependency
bundling or HTTP2 server push.

This can reduce page load times from `60s -> 1s`.

### Hot Module Replacement
`systemjs-tools` watches the filesystem for file changes and hot swaps
the changed file in the browser. This provides near instant iteration
cycles since code changes are immediately reflected in the browser
without reloading your page.

### Cross Session Caching
Many SystemJS projects have overcome the page reload times by creating
a `dev-bundle.js` via JSPM's `bundle --watch` command. This solves the
problem, but every time you rerun the command (often multiple times a
day), JSPM has to rebuild the bundle from scratch and you can wait over
60s (in large projects).

`systemjs-tools` makes extensive use of it's own persistent cache,
meaning you only pay the bundle time cost once. On a fresh start,
`systemjs-tools` loads it's cache and then scans the file system, busting
any files that have changed since the last time it run. This results
in a `cold start -> first page load` in less then 5 seconds.

### Automatic Configuration and Smart Defaults
`systemjs-tools` discovers as much as it can about your environment and
sets configuration defaults based on what it finds. This means that using
`systemjs-tools` in your own project is sometimes as simple as adding
`"systemjs": {}` to your `package.json` and running `systemjs serve`.

### Bundling
### Analysis Engine
### Production Builds
### Friendly Codebase
### JSPM Interop
### Development Feedback & Error Handling

### Config File Generation for node_modules (beta)
Currently the only automated way to automatically generate config files
for your dependencies is via JSPM. The `systemjs generate-config` command
leverages `alexisvincent/systemjs-config-builder` to analyse your
node_modules directory, generating a config file explaining to SystemJS
how to load packages from `node_modules`.

### Project Bootstrap
The `systemjs new [options] <name>` command can generate a minimal,
customizable, project boilerplate to get up and running with a full
dev/production environment in under 5s.

At initialization you can provide options to add feature layers to the
generated boilerplate. For example `--docker` adds `Dockerfile` and
`docker-compose.yml` files, providing your project with deterministic
runtimes.


## Usage
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



