'use strict'

const router = require('koa-router')()

router.get("/", function* (){
  yield bluebird.resolve(Project.findAll({
    include: [{
      model: Script,
      as: "seedScript",
    }],
    // raw: true,
  })).mapSeries((project) => {
    return project.getStatsInfo()
  }).then((r) => {
    this.body = r
  })
})

router.get("/:projectId/stats", function* (){
  const p = yield Project.findById(this.params.projectId)

  if (!p){
    this.body = {
      status: 500,
      message: 'not found project.'
    }

    return
  }

  this.body = yield p.getStatsBy("day")
})

router.get("/:projectId/sample_data", function* (){
  yield bluebird.resolve(Script.findAll({
    where: {projectId: this.params.projectId}
  })).map(async (n) => {
    return new Promise((resolve, reject) => {
      let currentLine = 0
      const r = []

      n.readResult(null, (data) => {
        currentLine += 1

        if (!data){
          resolve(r)
          return
        }

        r.push(_.merge({scriptName: n.name}, JSON.parse(data)))

        if (currentLine >= 20){
          return
        }

        return true
      })
    })
  }).then((r) => {
    this.body = _.chain(r).flatten().compact().value()
  })
})

router.post("/:projectId/start", function* (){
  const t = yield sequelize.transaction()

  try{
    const n = yield Project.findById(this.params.projectId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    })

    yield n.createSeedTask({transaction: t})
    yield t.commit()

    this.body = {
      status: 0,
      data: yield n.getStatsInfo()
    }
  }catch(e){
    yield t.rollback()

    throw e
  }
})

router.delete("/:projectId", function* (){

  const t = yield sequelize.transaction()

  try{
    const n = yield Project.findById(this.params.projectId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    })

    yield n.destroy({transaction: t})
    yield t.commit()

    this.body = {
      status: 0
    }
  }catch(e){
    logger.error(e)

    yield t.rollback()

    this.body = {
      status: 0,
      message: 'delete project failed.'
    }
  }
})

router.post("/", function* (){
  yield this.validateParams(
    {
      name: 'required',
      description: 'required',
      files: 'required',
    }
  )

  if (this.validationErrors){
    this.status = 500
    this.body = this.validationErrors
    return
  }

  const { name, description, files, hours } = this.params

  const p = yield Project.findOne({where: {name}})
  if (p){
    this.body = {
      status: 500,
      message: "the project name is exist."
    }

    return
  }

  const t = yield sequelize.transaction()

  try{
    yield bluebird.resolve(yield Project.create({
      name,
      description,
      cron: hours ? `0 0 */${hours} * * *` : null,
    }, {transaction: t})).then((project) => {
      return project.createScripts(files, {transaction: t}).then(() => {
        return project
      })
    }).then((project) => {
      return project.createSeedTask({transaction: t})
    })

    yield t.commit()

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
