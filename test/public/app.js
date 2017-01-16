import {DOM} from 'react'
import {render} from 'react-dom'

const {div} = DOM

render(div({}, 'Hello World'), document.getElementById('root'))