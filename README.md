# SystemJS Tools
[![npm version](https://badge.fury.io/js/systemjs-tools.svg)](https://badge.fury.io/js/systemjs-tools)

`systemjs-tools` is a collection of powerful, customizable build tools,
to help build compelling development and production stories for projects
that rely on [SystemJS](https://github.com/systemjs/systemjs). Think [figwheel](https://github.com/bhauman/lein-figwheel)
or [webpack](https://webpack.github.io/), for [SystemJS](https://github.com/systemjs/systemjs).

## Quick Start

Install the cli

`yarn global add systemjs-tools`

Navigate to your frontend root and initialise the config

**THIS STEP DOESN'T WORK YET, YOU NEED TO MANUALLY CREATE THE CONFIG**

`systemjs init`

Start the development server

`systemjs serve`

## Features

`systemjs-tools` provides you with the following

- [Snappy Page Refreshes](./docs/features.md#snappy-page-refreshes)
- [Hot Module Replacement](./docs/features.md#hot-module-replacement)
- [Cache Persistence (across process restarts)](./docs/features.md#cache-persistence)
- [Automatic Configuration and Smart Defaults](./docs/features.md#automatic-configuration-and-smart-defaults)
- [Bundling and Builds](./docs/features.md#bundling-and-builds)
- [Contribution Friendly Codebase](./docs/features.md#contribution-friendly-codebase)
- [**Automatic JSPM Interoperability**](./docs/features.md#automatic-jspm-interoperability)
- [**Development Feedback Console**](./docs/features.md#development-feedback-console)
- [node_modules package resolution (beta)](./docs/features.md#node_modules-package-resolution-beta)
- [Project Templates](./docs/features.md#project-templates)
- [**IDE Analysis Engine**](./docs/features.md#ide-analysis-engine)

*items in* ***bold*** *are unfinished*

## Motivation
Current development workflows for SystemJS leave much to
be desired. Projects end up clobbering together a slow, haphazard subset of
their desired workflow and the frustration this causes contributes to developers leaving the
SystemJS ecosystem. That's ridiculous, SystemJS provides EXCELLENT
primitives to build seamless development workflows and we should be
leveraging that. `systemjs-tools` is my contribution towards tooling for
the SystemJS ecosystem, and I would encourage you, if you have the time,
to help contribute towards filling the gaps that exist in our ecosystem.

## Usage
`systemjs-tools` exposes a `cli tool` and a `server-side library` and has deep integration
with [systemjs-hot-reloader](https://github.com/alexisvincent/systemjs-hot-reloader). Each exposes layered abstractions and hooks for you to describe your unique environment,
while still providing a largely automatic experience at all levels.

### Client
`systemjs-tools` uses [systemjs-hot-reloader](https://github.com/alexisvincent/systemjs-hot-reloader)
as its frontend client. As such you should follow the instructions listed in the README.

### General Usage
`systemjs-tools` (cli and server) upon initialization, searches upwards for
a `project root directory` (indicated by a `systemjs-tools.js` file or a `systemjs-tools`
key in your `package.json`). It then loads the relevant [config](./docs/config.md),
describing your environment (eg. baseURL directory and port to serve on).

If you do not already have a [config](./docs/config.md) file, navigate to the directory containing
your frontend source files and run `systemjs init` **(not ready yet)**,
to create a [config](./docs/config.md) describing your project.

Typically one would then run a command such as `systemjs serve`, to start
up a development server.

### Setting up trust for the SPDY server
It may be helpful to generate your own localhost certificates for the SPDY server and trust that with your browser.
Recently, Chrome and Firefox have begun rejecting certificates that do not specify a Subject Alternative Name.
Here is a one-liner to generate your own localhost.crt and localhost.key:

```
  openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -days 365 -nodes -subj '/CN=localhost' -reqexts SAN -extensions SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:localhost"))
```

To use this, specify a configuration within your systemjs-tools.js:

```js
fs = require('fs')

// Specify keys for localhost
module.exports.config.serve.keys = {
  key: fs.readFileSync('localhost.key', 'utf-8'),
  cert: fs.readFileSync('localhost.crt', 'utf-8'),
  ca: fs.readFileSync('localhost.key', 'utf-8'),
}
module.exports.config.channel = {
  keys: module.exports.config.serve.keys
}
```

### API

For an in-depth look at the API, checkout the links below.

1. [Config](./docs/config.md)
2. [Server](./docs/server.md)
3. [CLI](./docs/cli.md)

## Roadmap (currently usable for development)
- [x] basic development bundling with file busting
- [x] cli - boilerplate generation
- [x] cli - config generation via systemjs-config-builder
- [x] cli - serve wrapper
- [x] promise construct for serialization of builder operations
- [x] rxjs core api (for plugin communication)
- [x] cross session generic cache with file busting
- [x] development mode
- [x] sourcemap support
- [x] hot module replacement
- [x] handlers - [static, bundle]
- [x] basic documentation
- [x] handlers - [named bundle mappings]
- [ ] handlers - [compile, http2 server push]
- [ ] logging via `debug` package
- [ ] preemptive file loading
- [ ] production build story
- [ ] hmr - [preemptive sources]
- [ ] development console with error catching
- [ ] configuration schema and validation (using ajv)
- [ ] cli - use config schema to automatically expose options
- [ ] generic dependency tree mapping for hmr of things that have their
      own dependency resolvers (eg. sass and pcss)

