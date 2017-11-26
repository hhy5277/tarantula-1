'use strict'

const render = require('koa-ejs'),
{ isProduction } = require('../../utilities')

render(app, {
  root: `${__dirname}/../../views`,
  layout: 'layout/default',
  viewExt: 'ejs',
  cache: false,
  debug: false,
  strict: true,
});
