'use strict'

const router = require('koa-router')(),
{ isProduction } = require('../../utilities')


router.get("/", function* (){
  yield this.render("home")
})

module.exports = router
