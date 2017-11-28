'use strict'

const koa = require('koa')
global.app = new koa()
app.proxy = true        //for nginx forward

global.async = require('async')
global._ = require('lodash')

global.SETTINGS = require("../../config/tarantula-config.json")
global.SETTINGS = _.merge({}, SETTINGS['default'], SETTINGS[process.env['NODE_ENV'] || "development"])

require("../utilities")
require('require-dir-all')('./initializers')

module.exports = async function done(callback){
  if (_.isNil(global.initialized)){
    setImmediate(done, callback)
  }else{
    logger.info(`load config from ${_.chain(process.argv).get(1, "").split("/").last().value()}`)

    await callback()
  }
}
