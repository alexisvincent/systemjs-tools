# JSPM Devtool

### UNSTABLE!!! You can expect breaking changes to be released daily

## Motivation
JSPM Devtools is an experiment. I found myself implementing similar development/production
tooling for multiple projects based on JSPM, with only minor differences. This is an attempt to fix that. By allowing you to simply describe the things
that make your setup unique.
 
JSPM Devtools is a programatic abstraction over the kind of tasks every project ends up implementing.
These include (server-side asset bundling [js, css, scss, images, etc.], hot module replacement, error handling, development feedback).

JSPM Devtools takes a JIT approach, especially for development. What this
means is that assets will be compiled and bundled on the fly as they are needed, and then cached for later use.
However since this isn't what we want to be doing in production, JSPM Devtools allows you to use your the same config to generate efficient
production ready builds. And serve these without change, using the same webserver implementation as in development.

JSPM Devtools also tries to put the power in your hands. Instead of you building your project 'in' JSPM Devtools. You
use the tools it exposes to describe your own environment. A primary focus is to expose to the user the same tools we use internally
so that you have the power to describe any non typical aspects of your stack (turns out this is a typical requirement).

JSPM Devtools ships battery included. Meaning you should be able to have a working system up with minimal config and optimize it for your workflow
after the fact. We provide smart defaults in all cases where we can.

## Features
### Bundling
SystemJS provides the loader abstraction, enabling us to load arbitrary assets then to compile and consume these client side.
While this provides a lot of flexibility, it also means things aren't always as responsive as we would like in an iterative workflow. 
Specifically module compilation time and the latency induced my the [fetch file -> compile -> fetch dependencies -> compile ...]. This specifically can cause
load times in excess of 60 seconds on a large project. Obviously this is an unacceptable development experience.

JSPM Devtools exposes web request handlers, allowing you to compile assets and bundle dependencies as they are requested. Experimentally this has 
increased page load times on projects from 30s to 1.5s. This is before optimization.

HTTP2 Also provides us a unique opportunity. Since we can now push client dependencies to the browser so it has them before it needs them.

JSPM Devtools provides a way to leverage bundling tools and do this automatically.

### Hot Module Replacement
Hot Module Replacement is now an expected part of many developers workflow. JSPM Devtools is built with this in mind and provides primitives enable this kind of a workflow.

##API
```javascript

// JSPM Devtools exposes a make function, which (when provided with a config) 
// returns an instance on JSPM devtools tailored to your setup
const { make } = require('jspm-devtools');

const devtools = make({
    // Path to package.json [optional - defaults to process.cwd()]
    // This is the primary source of configuration since we can infer a lot from this
    // Specifically the server root, base url and config directory
    packagePath: process.cwd(),
    
    // Instance of jspm [optional]
    // If you supply an instance of jspm here, we will use it instead
    // We assumed it is preconfigured.
    jspm: jspm,
    
    // Hot Module Replacement [optional - defaults to false]
    hmr: true,
    
    // Instance of socket.io [required when hmr == true]
    // This is used to communication HMR information to the client
    io: socketio(server),
    
    // A list of entries to your application [optional]
    // This is simply used to premptively cache files you might load to speed up the first load
    entries: ['app/app.js'],
    
    // Function that returns an express handler 
    // [optional - defaults to ({resolvers, initatedBySystemJS}) => initatedBySystemJS ? resolvers.bundle() : resolvers.next() ]
    // Sometimes you want to programatically decide how to handle requests.
    // To support this, you can provide a resolve handler
    // This handler accepts information about the request being made and needs to return
    // an express handler (req, res, next) => {...},
    // To help with this, we provide a bunch of handler generators that you can invoke to
    // describe what you want to do.
    resolveHandler: ({ req, initiatedBySystemJS, resolvers, tools }) => {
        // req is the request object
        // initiatedBySystemJS is true if the file was requested by the SystemJS library, else false
        // resolvers are functions that return express handlers
        // tools is an instance of the tools object returned from the make function 
        
        // resolvers are functions that return handlers described below:
        // bundle - bundles the dependencies of the file specifies [defaults to req.originalUrl]
        // next   - don't handle this request (pass it through to the next express middleware)
        const {bundle, next} = resolvers
        
        // If the file being requested is depencies.js bundle app/app.js and return that
        // otherwise fallthrough.
        return req.originalUrl.endsWith("dependencies.js")
            ? bundle({expression: 'app/app.js'})
            : next()
    }
})


/**
 * Delegate to devtools handler as first point of entry
 */
app.use("*", devtools.handler)
```
