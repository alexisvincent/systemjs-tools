# Server (WIP)
## Install
npm - `npm install systemjs-tools`

yarn - `yarn add systemjs-tools`

## Usage
```javascript

/**
 * systemjs-tools exposes the init function which accepts as an
 * argument, an override config object, and returns a static tools
 * object representing your environment.
 */

const { init } = require('systemjs-tools');

// initialize systemjs-tools
const tools = init({ /** your config overrides **/ })

// do some stuff
tools.serve()
```

### tools.serve
```js
/**
 * HTTP2 server behaving as specified in config.serve
 *
 * accepts as argument, an override object for config.serve
 */
 tools.serve({ port: 8000 })
```

