'use strict'

const router = require('koa-router')(),
          fs = require('fs')


router.get(/\//, function* (){

  if (isProduction &&
    (SETTINGS.ip_white_list || []).length > 0 &&
    !_.find(SETTINGS.ip_white_list || [], (n) => new RegExp(n).test(this.ip))
  ){
    this.status = 401
    return
  }

  yield this.render("index", {
    layout: 'layout/vue',

    i18n: require(`${this.i18n.directory}/${this.i18n.getLocale()}${this.i18n.extension}`)
  })
})

module.exports = router
