import {Route, IndexRoute, Redirect} from 'react-router'
import React from 'react'

/**
 * Containers
 */
import Index from './routes/index.js';
import Dashboard from './routes/dashboard/dashboard';

/**
 * Routes
 */
const routes = [
    <Route path="/" component={Index}>
        <IndexRoute component={Dashboard}/>
    </Route>
]

export {routes as default, routes}
