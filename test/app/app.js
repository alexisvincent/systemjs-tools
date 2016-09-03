import {build} from 'js-kernel'

import reducer from './reducer.js'
import routes from './routes.js'
// import {initialState} from './core/entities/utilities.js'
// import './app.ncss'

const kernel = build({
    routes,
    reducer
}, {})

kernel.render()
