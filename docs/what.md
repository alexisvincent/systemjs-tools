# WHAT? (not finished)
`systemjs-tools` is a collection of powerful, customizable tools,
to help build compelling development and production stories for projects
that rely on `SystemJS`. Think [figwheel](https://github.com/bhauman/lein-figwheel)
or webpack, for SystemJS.

It exposes a `cli tool`, a `server-side library` and a `client
library`. Each exposes layered abstractions and hooks for you to describe
your unique environment, while still providing a largely automatic
experience at all levels.

## Snappy Page Loading
SystemJS can take forever to load all modules into the browser,
this is because of the module compilation time and the latency induced by
the `[fetch file -> compile -> fetch dependencies -> compile ...]` cycle,
which can take over a minute in large projects.

To address this, `systemjs-tools` compiles all assets server side and
pushes all dependencies upfront to the browser, via either dependency
bundling or HTTP2 server push.

This can reduce page load times from `60s -> 1s`.

## Hot Module Replacement
`systemjs-tools` watches the filesystem for file changes and hot swaps
the changed file in the browser. This provides near instant iteration
cycles since code changes are immediately reflected in the browser
without reloading your page.

## Cross Session Caching
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

## Automatic Configuration and Smart Defaults
`systemjs-tools` discovers as much as it can about your environment and
sets configuration defaults based on what it finds. This means that using
`systemjs-tools` in your own project is sometimes as simple as adding
`"systemjs": {}` to your `package.json` and running `systemjs serve`.

## Bundling
## Analysis Engine
## Production Builds
## Friendly Codebase
## JSPM Interop
## Development Feedback & Error Handling

## Config File Generation for node_modules (beta)
Currently the only automated way to automatically generate config files
for your dependencies is via JSPM. The `systemjs generate-config` command
leverages `alexisvincent/systemjs-config-builder` to analyse your
node_modules directory, generating a config file explaining to SystemJS
how to load packages from `node_modules`.

## Project Bootstrap
The `systemjs new [options] <name>` command can generate a minimal,
customizable, project boilerplate to get up and running with a full
dev/production environment in under 5s.

At initialization you can provide options to add feature layers to the
generated boilerplate. For example `--docker` adds `Dockerfile` and
`docker-compose.yml` files, providing your project with deterministic
runtimes.


