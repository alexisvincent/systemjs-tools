/**
 * Created by alexisvincent on 2016/09/03.
 */

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'


const reducers = {
};

const rootReducer = combineReducers({
    router: routerReducer,
    ...reducers
});

export default rootReducer;

