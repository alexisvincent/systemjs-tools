# SystemJS Tools
`systemjs-tools` is a collection of powerful, customizable tools,
to help build compelling development and production stories for projects
that rely on `SystemJS`. Think [figwheel](https://github.com/bhauman/lein-figwheel)
or webpack, for SystemJS.

## [WHAT?](./docs/what.md)
[Find out about what systemjs-tools can do for you here](./docs/what.md)

## WHY?
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

## [HOW?](./docs/how.md)
`systemjs-tools` exposes a `cli tool`, a `server-side library` and a `client
library`. Each exposes layered abstractions and hooks for you to describe
your unique environment, while still providing a largely automatic
experience at all levels.

[Find out about how to use systemjs-tools here](./docs/how.md)

## Roadmap (currently usable for development)
- [x] basic development bundling with file busting
- [x] cli - boilerplate generation
- [x] cli - config generation via systemjs-config-builder
- [x] cli - serve wrapper
- [x] promise construct for serialization of builder operations
- [x] rxjs core api (for plugin communication)
- [x] cross session generic cache with file busting
- [x] development mode
- [x] sourcemap support - [issue pending](https://github.com/systemjs/builder/issues/754)
- [x] hot module replacement
- [x] handlers - [static, bundle]
- [ ] basic documentation
- [ ] handlers - [compile, http2 server push]
- [ ] logging via `debug` package
- [ ] preemptive file loading
- [ ] production build story
- [ ] hmr - [preemptive sources]
- [ ] development console with error catching
- [ ] configuration schema and validation
- [ ] cli - use config schema to automatically expose options
- [ ] generic dependency tree mapping for hmr of things that have their
      own dependency resolvers (eg. sass and pcss)

