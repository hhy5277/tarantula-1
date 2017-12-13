'use strict'

const router = require('koa-router')()

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
