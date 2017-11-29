'use strict'

const router = require('koa-router')(),
{ sequelize } = require("../../models")

const PROXY_SIZE = 30

router.get("/test", function* (){
  this.body = yield Project.fuckAll()
  return

  const n = yield Task.findOne()

  yield n.fail()
  this.body = {}
  return

  const p = yield n.getProject()

  const t = yield sequelize.transaction()

  try{
    yield p.destroy({transaction: t})
    yield t.commit()
  }catch(e){
    yield t.rollback()
  }


  this.body = {}
  return

  const nn = yield p.getScript({transaction: t})

  try{
    // nn.forEach(async (n1) => {
    //   await n1.destroy({transaction: t})
    // })

    yield nn.destroy({transaction: t})
    logger.warn("fuck all")
    yield t.commit()
  }catch(e){
    yield t.rollback()
  }


  // const n1 = yield p.getScript()


  // this.body = yield n1.getTasks()

  this.body = {}
})

router.get("/", function* (){
  const t = yield sequelize.transaction()

  try{
    const undoList = yield Stats.findAll({
      include: [{
        model: Script,
        attributes: ['name'],
      }],
      attributes: ['undo', 'scriptId'],
      where: {undo: {$gt: 0}}
    }, {transaction: t})

    const maxCount = SETTINGS.FETCH_MAX_TASK_COUNT || 100
    const num = parseInt(maxCount / undoList.length)

    const tasks = yield Promise.all(_.map(undoList, async (n) => {
      const m = await Task.scope("undo").findAll({
        // attributes: ['id', 'url', 'context'],
        where: {scriptId: n.scriptId},
        limit: num,
      }, {transaction: t})

      return await Promise.all(_.map(m, async (mm) => {
        await mm.deliver({transaction: t})

        return _.pick(
          _.merge({}, mm.get(), {scriptName: n.script.name}),
          ['id', 'url', 'context', 'scriptName']
        )
      }))
    }))

    yield t.commit()

    this.body = {
      tasks: _.chain(tasks).flatten().shuffle().value()
    }
  }catch(e){
    logger.error(e)

    yield t.rollback()

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
