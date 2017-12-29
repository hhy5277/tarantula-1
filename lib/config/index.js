'use strict'

const koa = require('koa')
global.app = new koa()
app.proxy = true        //for nginx forward

global.async = require('async')
global.bluebird = require("bluebird")
global.moment = require("moment")

require("./settings")
require('require-dir-all')('./initializers')

module.exports = async function done(callback){
  if (_.isNil(global.initialized)){
    setImmediate(done, callback)
  }else{
    logger.info(`load config from ${_.chain(process.argv).get(1, "").split("/").last().value()}`)

    try{
      process.exit(await callback())
    }catch(e){
      process.exit(1)
    }
  }
}
