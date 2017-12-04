'use strict'

const router = require('koa-router')(),
{ sequelize } = require("../../models")

router.get("/", function* (){
  yield bluebird.resolve(Project.findAll({
    include: [{
      model: Script,
      as: "seedScript",
    }],
    // raw: true,
  })).map(async (project) => {
    const s = await project.getStats()

    const t = _.sumBy(s, (n) => {
      return n.undo + n.delivered + n.succeed + n.failed
    })

    const f = _.sumBy(s, (n) => {
      return n.undo + n.delivered
    })

    return _.merge({}, project.get(), {
      progress: t == 0 ? 0 : Number(((t - f) / t * 100).toFixed(1))
    })
  }).then((r) => {
    this.body = _.map(r, (n) => {
      return _.chain(n).pick([
        'id',
        'name',
        'description',
        'createdAt',
        'progress'
      ]).merge({
        'cron': !_.isEmpty(n.cron),
        seedScriptName: _.get(n, 'seedScript.name'),
      }).value()
    })
  })
})

router.get("/:projectId/stats", function* (){
  _.chain(yield Stats.findAll({
    where: {
      projectId: this.params.projectId
    },
    include: [Project, Script],
    raw: true,
  })).map((n) => {
    return _.chain(n).pick(['undo', 'delivered', 'failed', 'succeed']).thru((r) => {
      return _.merge({}, r, {
        day: moment(n.day).format("YYYY-MM-DD"),
        name: n['project.name'],
        scriptName: n['script.name'],
      })
    }).value()
  }).tap((r) => {
    this.body = r
  }).value()
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

module.exports = router
