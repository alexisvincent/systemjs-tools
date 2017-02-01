# Client (WIP - a bit cluncky, but will be improved)
## Prerequisites

`systemjs-tools` relies on socket.io-client being available. We don't specify this as a peer dep since this causes issues with `JSPM` / `npm` interop.

`systemjs-tools` also relies on the System.reload polyfill, available via `systemjs-hmr`.

## Install
npm - `npm install systemjs-tools systemjs-hmr socket.io-client`

yarn - `yarn add systemjs-tools systemjs-hmr socket.io-client`

jspm - `jspm install npm:systemjs-tools npm:systemjs-hmr socket.io-client`

## Usage

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
