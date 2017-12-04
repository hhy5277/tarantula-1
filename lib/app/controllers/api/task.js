'use strict'

const router = require('koa-router')(),
{ sequelize } = require("../../models")

const PROXY_SIZE = 30

router.get("/test", function* (){
  const t = yield sequelize.transaction()

  const s = yield Script.findOne()
  _.chain().range(20).map(() => {
    return {
      url: "-",
      // createdAt: moment().subtract(1, "days").toDate(),
      // updatedAt: moment().subtract(1, "days").toDate(),
    }
  }).thru((items) => {
    return s.createTasks(items)
  }).value()

  this.body = {}
})

router.get("/", function* (){
  try{
    this.body = yield Project.getUndoTasks()
  }catch(e){
    this.body = {
      status: 500,
      message: 'fetch tasks failed.'
    }
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
