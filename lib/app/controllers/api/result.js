'use strict'

const router = require('koa-router')(),
{ sequelize } = require("../../models")

router.post("/", function* (){

  const t = yield sequelize.transaction()

  const f = _.chain(_.range(0, 1000)).map(async () => {
    const m = await Script.findOne({transaction: t})

    return Task.create({
      url: "-",
      context: "{}",
      scriptId: m.id,
      projectId: m.projectId,
    }, {
      // include: [Script, Project],
      transaction: t
    })
  }).value()

  try{
    yield Promise.all(f)
    yield t.commit()
  }catch(e){
    logger.error(e)

    yield t.rollback()
  }

  this.body = {}
})

module.exports = router
