'use strict'

const router = require('koa-router')(),
         raw = require('raw-body'),
        zlib = require('zlib'),
{ verifyToken } = require("../../services/verify")


router.post("/", verifyToken, function* (next){
  if (!this.is("gzip/json")){
    return yield next
  }

  _.chain(yield raw(this.req, {
    length: this.req.headers['content-length'],
  })).tap((buffer) => {
    _.merge(this.params, JSON.parse(zlib.gunzipSync(buffer).toString()))
  }).value()

  return yield next
}, function* (){

  const t = yield sequelize.transaction()

  const trigger = bluebird.mapSeries(_.get(this.params, "result", []), async (n) => {
    const task = await Task.findById(n.id, {lock: t.LOCK.UPDATE, transaction: t})
    if (!task){
      logger.warn(`not found task: ${n.id}`)
      return
    }

    if (n.message){
      return await task.fail(n.message, {transaction: t})
    }

    await bluebird.mapSeries(n.tasks || [], async ({ url, context, scriptName }) => {
      const p = await task.getProject({transaction: t})

      const s = _.first(await p.getScripts({
        where: {name: scriptName},
        transaction: t
      }))

      if (!s){
        logger.warn(`not found script: ${scriptName}`)
        return
      }

      return await Task.create({
        url,
        context,
        scriptId: s.id,
        projectId: p.id,
      }, { transaction: t })
    })

    await task.success(n.result, {transaction: t})
  })

  const nodeTrigger = bluebird.resolve(_.get(this.params, "result", [])).then((items) => {
    const c = _.filter(items, (n) => n.message)

    return [
      items.length - c.length,
      c.length
    ]
  }).spread((succeedCount, failedCount) => {
    return Node.update({
      succeed: sequelize.literal(`\`succeed\` + ${succeedCount}`),
      failed: sequelize.literal(`\`failed\` + ${failedCount}`),
    } , {
      where: {ip: this.ip},
      transaction: t
    }).then((nn) => {
      if (_.first(nn)){
        return
      }

      return Node.create({
        ip: this.ip,
        succeed: succeedCount,
        failed: failedCount,
      }, {transaction: t})
    })
  })

  try{
    yield Promise.all([trigger, nodeTrigger])

    yield t.commit()

    this.body = {
      status: 0
    }
  }catch(e){
    logger.error(e)
    yield t.rollback()

    throw e
  }
})

module.exports = router
