'use strict'

const { CronJob } = require('cron')

//reset unmanaged tasks
new CronJob("0 0 */1 * * *", async function (){
  const t = await sequelize.transaction()

  try{
    await bluebird.resolve(Task.scope("unmanaged").findAll({
      lock: t.LOCK.UPDATE,
      transaction: t,
    })).map((n) => {
      return n.reset(n.attempts, {transaction: t})
    })

    await t.commit()
  }catch(e){
    logger.error(e)
    await t.rollback()
  }

}).start()


//clean up the not completed tasks on today
new CronJob('0 0 0 * * *', async function (){
  if (!SETTINGS.auto_clean_expired_tasks){
    return
  }

  const t = await sequelize.transaction()

  try{
    await bluebird.resolve(Task.scope("expired").findAll({
      lock: t.LOCK.UPDATE,
      transaction: t,
    })).map((n) => {
      return n.destroy({transaction: t})
    })

    await t.commit()
  }catch(e){
    logger.error(e)
    await t.rollback()
  }

}).start()
