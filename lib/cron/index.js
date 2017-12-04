'use strict'

const { CronJob } = require('cron')

;(async function done(callback){
  if (_.isNil(global.initialized)){
    setImmediate(done, callback)
  }else{
    await callback
  }
})(async () => {
  await bluebird.resolve(Project.scope('cron').findAll()).map((n) => {
    new CronJob(n.cron, async function(){

      const p = await Project.findById(n.id)
      if (!p || _.isEmpty(p.cron || "")){
        this.stop()
        return
      }

      await n.createSeedTask()

    }).start()
  })
})
