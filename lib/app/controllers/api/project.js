'use strict'

const router = require('koa-router')(),
{ verifyToken, verifySession } = require("../../services/verify")

router.get("/", verifySession, function* (){
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

router.get("/:projectId/stats", verifySession, function* (){
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

router.get("/:projectId/sample_data", verifySession, function* (){
  yield bluebird.resolve(Script.findAll({
    where: {projectId: this.params.projectId}
  })).map(async (n) => {
    return new Promise((resolve, reject) => {
      let currentLine = 0
      const r = []

      n.loadResult(null, (data) => {
        currentLine += 1

        if (!data){
          resolve(r)
          return
        }

        r.push(_.merge({scriptName: n.name}, data))

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

router.post("/:projectId/start", verifySession, function* (){
  const t = yield sequelize.transaction()

  try{
    const n = yield Project.findById(this.params.projectId, {
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

router.post("/:projectId/reset", verifySession, function* (){
  const t = yield sequelize.transaction()

  try{
    const n = yield Project.findById(this.params.projectId, {
      transaction: t
    })

    yield n.reset(0, {transaction: t})
    yield t.commit()

    this.body = {
      status: 0,
    }
  }catch(e){
    yield t.rollback()

    throw e
  }
})

router.post("/:projectId/message", verifySession, function* (){

  const p = yield Project.findById(this.params.projectId)

  const messages = [
    /*
    {
      "@url": "http://sina.com.cn",
      "@context": "{\"fuck\": 1}",
      "@createdAt": new Date() * 1,

      name: "haha",
      scriptName: "fuck.js",
      message: `
        alksjdklajsdlkjalskjd
        alksjdklajsdlkjalskjd
        sdf
        sdfsdligkfj
        alksjdklajsdlkjalskjd
        laskjd
      `
    }
    */
  ]
  yield bluebird.map(p.getScripts(), (n) => {
    n.loadError((line) => {
      if (messages.length >= 20){
        return
      }
      if (line.length > 0){
        messages.push(line)
      }

      return true
    })
  })

  this.body = {status: 0, messages}
})

router.delete("/:projectId", verifySession, function* (){

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

router.post("/", verifyToken, function* (){
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

  const { name, description, files, hours, overwrite } = this.params

  const p = yield Project.findOne({where: {name}})
  if (p && !overwrite){
    this.body = {
      status: 500,
      message: "the project name is exist."
    }

    return
  }

  const t = yield sequelize.transaction()

  try{
    yield bluebird.resolve().then(() => {
      return p || Project.create({
        name,
        description,
        cron: hours ? `0 0 */${hours} * * *` : null,
      }, {transaction: t})
    }).then(async (project) => {
      if (!overwrite){
        return project
      }

      const scripts = await project.getScripts()
      await bluebird.mapSeries(scripts, (s) => {
        const file = _.find(files, (n) => s.get().name == n.name)
        if (!file){
          return s.destroy({transaction: t})
        }

        return s.update(file, {transaction: t})
      })

      await bluebird.mapSeries(files, (file) => {
        const s = _.find(scripts, (n) => n.get().name == file.name)
        if (!s){
          return project.createScripts([file], {transaction: t})
        }
      })

      return project
    }).then((project) => {
      if (overwrite){
        return project
      }

      if (files.length == 1){
        _.first(files).isSeed = true
      }

      return project.createScripts(files, {transaction: t}).then(() => {
        return project
      })
    }).then((project) => {
      if (overwrite){
        return
      }

      return project.createSeedTask({transaction: t})
    })

    yield t.commit()

    this.body = {
      status: 0,
      message: 'upload succeed'
    }
  }catch(e){
    logger.error(e)

    t.rollback()

    this.body = {
      status: 500,
      message: 'upload failed'
    }
  }
})

module.exports = router
