'use strict'

const router = require('koa-router')()

const PROXY_SIZE = 30

router.get("/", function* (){
  const count = yield Proxy.count({where: { status: 'valid'}})
  const skip = parseInt(_.max([0, count - PROXY_SIZE]) * Math.random())

  this.body = {
    proxies: yield Proxy.findAll({
      attributes: ['category', 'ip', 'port'],
      where: { status: 'valid'},
      offset: skip,
      limit: PROXY_SIZE
    }),

    tasks: [{
      haha: 1
    }, {haha: 2}]

    // tasks: []
  }
})

module.exports = router
