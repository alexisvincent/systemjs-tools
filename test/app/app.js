import 'react-hot-loader/patch'
// import {build} from 'js-kernel'
import {render} from 'react-dom'
import React, {createElement, DOM} from 'react'
import {connect} from 'systemjs-tools/dist/client.js'

import Dashboard from './routes/dashboard/dashboard.js'

connect()

// import reducer from './reducer.js'
// import routes from './routes.js'

// const kernel = build({
//     routes,
//     reducer
// })

// kernel.render()


render(createElement(Dashboard), document.body)

