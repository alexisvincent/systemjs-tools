# Server (WIP)
## Install
- `npm install systemjs-tools systemjs-builder`
- `yarn add systemjs-tools systemjs-builder`

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

### tools.handlers
```js
/**
 * systemjs-tools exposes the http handler factories, we use internally
 * for you to compose your own custom handlers. All the exposed handlers are
 * functions, accepting an options object and returning a handler accepting
 * (req, res, next), where req and res are standard node HTTP request and
 * response objects and next is a function that will be called if the
 * handler doesn't know how to handle the request. The only exception to
 * this is the defaultHandler.
 *
 * Normally, you would use these handler factories to generate a custom
 * handler for use in config.handler, however you are obviously free to
 * use them in your own HTTP server.
 */

 /**
```
