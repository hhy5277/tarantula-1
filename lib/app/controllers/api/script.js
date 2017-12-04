'use strict'

const router = require('koa-router')()

router.get("/", function* (){

})

router.post("/get_code", function* (){
  yield _.chain(this.params.items).map(async (n) => {
    const r = await Script.findOne({
      where: {
        name: n.scriptName,
        md5: n.md5
      }
    })

    return _.merge({}, n, {
      code: _.get(r, "code")
    })
  }).thru(async (f) => {
    this.body = await Promise.all(f)
  }).value()
})

module.exports = router
