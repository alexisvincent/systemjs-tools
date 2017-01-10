TODO: Refractor this out to docs
```
const {

    // config object representing your environment
    config,

    /**
     * function to start an http2 server
     * accepts an overrides object conforming to config.serve schema,
     * which is merged into config.serve
     */
    serve,

    /**
     * A function which accepts an http (request, response) and returns
     * useful information which you can use in your own handlers
     * (for tools.serve or your own http server)
     */
    analyse,

    // a collection of http handlers
    handlers,

    // systemjs-tools internals
    _
} = tools


const {
   initiatedBySystemJS // was this request initiated by SystemJS
} = analyse(req, res)

const {
    // At the moment only bundle is implemented
    bundle, // sends a bundle of the requested file and it's deps
    compile, // sends a compiled version of the file
    serverPush // push the files dependencies to the server and send the file
} = handlers

```

#### Start an http2 server (override port and handler with bundle handler)
```javascript

const { init } = require('systemjs-tools');

const { serve, handlers } = init()

serve({ port: 2000, handler: handlers.bundle })
```

#### Start an http2 server (with custom handler)
```javascript
const { init } = require('systemjs-tools');

const { serve, handlers } = init()

const customHandler = (req, res, next) => {
    const { initiatedBySystemJS } = analyse(req, res)

    if (initiatedBySystemJS) handlers.compile(res, req, next)
    else next()
}

serve({ handler: customHandler})
```

