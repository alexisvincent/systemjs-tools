# CLI
## Install
npm - `npm install --global systemjs-tools`

yarn - `yarn global add systemjs-tools`

## Usage
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
