'use strict'

const router = require('koa-router')(),
{ sequelize } = require("../../models")

router.get("/", function* (){

})

router.post("/", function* (){
  yield this.validateParams(
    {
      name: 'required',
    }
  )

  if (this.validationErrors){
    this.status = 500
    this.body = this.validationErrors
    return
  }

  const { name, description, files, hours } = this.params

  const nn = yield Project.findOne({where: {name}})
  if (nn){
    this.body = {
      status: 500,
      message: "the project name is exist."
    }

    return
  }

  const t1 = yield sequelize.transaction()

  try{
    const newProject = yield Project.create({
      name,
      description,
      cron: hours ? `0 0 */${hours} * * *` : null,
    }, {transaction: t1})

    yield _.map(files, async (n) => {
      const s = await Script.create({
        projectId: newProject.id,
        name: n.name,
        code: n.content,
      }, {transaction: t1})

      if (n.isSeed){
        newProject.seedScriptId = s.id
        await newProject.save({transaction: t1})

        await Task.create({
          scriptId: s.id,
          projectId: newProject.id,
        }, {transaction: t1})
      }
    })

    yield t1.commit()

    this.body = {
      status: 0,
      message: 'upload succeed'
    }
  }catch(e){
    logger.error(e)

    t1.rollback()

    this.body = {
      status: 500,
      message: 'upload failed'
    }
  }
})

module.exports = router
