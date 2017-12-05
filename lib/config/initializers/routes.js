'use strict'

require('./session')

app.use(async (ctx, next) => {
  _.merge(ctx.state, {
    isProduction: isProduction
  })

  await next()
})

const t = _.cloneDeep(require("../../app/controllers"))

const autoRouter = require('koa-autoload-router')
app.use(autoRouter(app, {
    root: `${__dirname}/../../app/controllers`,
    suffix: '.js',
    //prefix: BASE_NAME,
}))

// index router
app.use(t.routes())
