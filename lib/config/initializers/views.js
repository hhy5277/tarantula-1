'use strict'

const render = require('koa-ejs')

render(app, {
  root: `${__dirname}/../../views`,
  layout: 'layout/default',
  viewExt: 'ejs',
  cache: isProduction,
  debug: false,
  strict: true,
});
