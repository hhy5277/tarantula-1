'use strict'

const router = require('koa-router')(),
          fs = require('fs')


router.get(/\//, function* (){

  // this.body = yield Script.findOne({}, {raw: true})
  // return

  yield this.render("index", {
    //i18n: JSON.parse(fs.readFileSync(`${this.i18n.directory}/${this.i18n.getLocale()}${this.i18n.extension}`, 'utf8'))
    i18n: require(`${this.i18n.directory}/${this.i18n.getLocale()}${this.i18n.extension}`)
  })
})

module.exports = router
