/**
 * Created by alexisvincent on 2016/09/04.
 */
const jspm = require('jspm')
const builder = new jspm.Builder()

const buildOpts = {}

builder.trace('app/app.js').then(trace => {
    builder.bundle(trace, buildOpts).then(bundled => {

        console.log(Object.keys(bundled.tree).filter(key => {
            return bundled.tree[key] == false || bundled.tree[key].path == undefined
        }))

        Object.keys(bundled.tree).forEach(dep => {
            builder.compile(dep, buildOpts).then(compiled => {
                // console.log(Object.keys(compiled))
            }).catch(compiled => {
                console.log("Failed to compile " + dep)
            })
        })
    })
})
