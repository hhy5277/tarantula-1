'use strict'

const router = require('koa-router')(),
          fs = require('fs')


router.get(/\//, function* (){

  if (isProduction){
    if (!_.includes(SETTINGS.ip_white_list, this.ip)){
      this.status = 401
      return
    }
  }

  yield this.render("index", {
    i18n: require(`${this.i18n.directory}/${this.i18n.getLocale()}${this.i18n.extension}`)
  })
})

module.exports = router
