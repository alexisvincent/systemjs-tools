# SystemJS Tools (beta)
`systemjs-tools` is a collection of powerful, customizable build tools,
to help build compelling development and production stories for projects
that rely on [SystemJS](https://github.com/systemjs/systemjs). Think [figwheel](https://github.com/bhauman/lein-figwheel)
or [webpack](https://webpack.github.io/), for [SystemJS](https://github.com/systemjs/systemjs).

## Quick Start

Install the cli

`yarn global add systemjs-tools`

Navigate to your frontend root and initialise the config

**THIS STEP DOESN't WORK YET, YOU NEED TO MANUALLY CREATE THE CONFIG**

`systemjs init`

Start the development server

`systemjs serve`

## WHAT?

`systemjs-tools` provides you with the following

- [Snappy Page Refreshes](./docs/what.md#snappy-page-refreshes)
- [Hot Module Replacement](./docs/what.md#hot-module-replacement)
- [Cache Persistence (across process restarts)](./docs/what.md#cache-persistence)
- [Automatic Configuration and Smart Defaults](./docs/what.md#automatic-configuration-and-smart-defaults)
- [Bundling and Builds](./docs/what.md#bundling-and-builds)
- [Contribution Friendly Codebase](./docs/what.md#contribution-friendly-codebase)
- [**Automatic JSPM Interoperability**](./docs/what.md#automatic-jspm-interoperability)
- [**Development Feedback Console**](./docs/what.md#development-feedback-console)
- [node_modules package resolution (beta)](./docs/what.md#node_modules-package-resolution-beta)
- [Project Templates](./docs/what.md#project-templates)
- [**IDE Analysis Engine**](./docs/what.md#ide-analysis-engine)

*items in* ***bold*** *are unfinished*

## WHY?
Current development workflows for SystemJS leave much to
be desired. Projects end up clobbering together a slow, haphazard subset of
their desired workflow and the frustration this causes contributes to developers leaving the
SystemJS ecosystem. That's ridiculous, SystemJS provides EXCELLENT
primitives to build seamless development workflows and we should be
leveraging that. `systemjs-tools` is my contribution towards tooling for
the SystemJS ecosystem, and I would encourage you, if you have the time,
to help contribute towards filling the gaps that exist in our ecosystem.

## HOW?
`systemjs-tools` exposes a `cli tool`, a `server-side library` and a `client
library` (all provided in the npm package `systemjs-tools`). Each exposes
layered abstractions and hooks for you to describe your unique environment,
while still providing a largely automatic experience at all levels.

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

For an in-depth look at the API, checkout the links below.

1. [Config](./docs/config.md)
2. [Server](./docs/server.md)
3. [Client](./docs/client.md)
4. [CLI](./docs/cli.md)

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
- [ ] basic documentation
- [ ] handlers - [bundle -> dynamic bundle queries via query string]
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

