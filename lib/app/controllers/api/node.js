'use strict'

const router = require('koa-router')(),
{ verifySession } = require("../../services/verify")

router.get("/", verifySession, function* (){

  this.body = {
    status: 0,
    items: _.chain(yield Node.findAll({raw: true})).map((n) => {
      return _.merge(_.omit(n, ['createdAt']), {updatedAt: moment(n.updatedAt).format("YYYY-MM-DD HH:mm:ss")})
    }).value()
  }
})

module.exports = router
