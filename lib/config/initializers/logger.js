'use strict'

const log4js = require('koa-log4')

const http = log4js.getLogger("http")
http.level = "ALL"

app.use(log4js.koaLogger(http, { level: 'auto' }))

global.logger = log4js.getLogger("manual")
global.logger.level = "ALL"
