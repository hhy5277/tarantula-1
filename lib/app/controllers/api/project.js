'use strict'

const router = require('koa-router')()

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
