'use strict'

const router = require('koa-router')()

const PROXY_SIZE = 30

router.get("/", function* (){
  const count = yield Proxy.scope("valid").count()
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

router.delete("/:id", function* (){
  const n = yield Task.findById(this.params.id)
  if (n){
    yield n.destroy()
  }

  this.body = {}
})

module.exports = router
