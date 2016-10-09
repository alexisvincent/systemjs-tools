import {build} from 'js-kernel'
import {devtools} from 'jspm-devtools/dist/client.js'

devtools()

import reducer from './reducer.js'
import routes from './routes.js'

const kernel = build({
    routes,
    reducer
})

kernel.render()
