'use strict';

const STATUS = {
  undo: 1,
  delivered: 2,
  succeed: 3,
  failed: 4,
}

module.exports = (sequelize, DataTypes) => {
  var task = sequelize.define('task', {
    url: DataTypes.STRING,
    scriptId: DataTypes.INTEGER.UNSIGNED,
    projectId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: _.values(STATUS),
      defaultValue: STATUS.undo,
    },
    attempts: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    context: DataTypes.STRING,
    expiredAt: {
      type: DataTypes.DATE,
      // defaultValue: () => moment().endOf('day').toDate(),
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },

    hooks: {
      afterSave: function(m, options){
        logger.info("task afterSave")
      },

      afterCreate: function(m, options){
        logger.info(`task afterCreate`)

        const f = {
          scriptId: m.scriptId,
          day: moment(m.createdAt).startOf("hours").toDate(),
          projectId: m.projectId,
        }

        const status = _.findKey(STATUS, nn => nn == m.status)

        return Stats.update({
          [status]: sequelize.literal(`\`${status}\` + 1`),
        } , {
          where: f,
          transaction: options.transaction,
        }).then((n) => {
          if (_.first(n)){
            return
          }

          return Stats.create(_.merge({}, f, {
            [status]: 1
          }), {transaction: options.transaction})
        })
      },

      afterUpdate: function(m, options){
        const [updatedAt, preUpdatedAt] = [
          moment(m.updatedAt).startOf("hours").toDate(),
          moment(m.previous('updatedAt')).startOf("hours").toDate()
        ]

        const [status, preStatus] = [
          _.findKey(STATUS, nn => nn == m.status),
          _.findKey(STATUS, nn => nn == m.previous('status')),
        ]

        if (updatedAt == preUpdatedAt && status == preStatus){
          return
        }

        logger.info(`task afterUpdate: ${status} ${preStatus}`)

        if (_.isNil(preStatus)){
          throw `preStatus is null`
        }

        const f = {
          projectId: m.projectId,
          scriptId: m.scriptId,
        }

        if (updatedAt == preUpdatedAt){
          return Stats.update({
            [status]: sequelize.literal(`\`${status}\` + 1`),
            [preStatus]: sequelize.literal(`\`${status}\` - 1`),
          } , {
            where: _.merge({}, f, {day: updatedAt}),
            transaction: options.transaction,
          })
        }

        return Stats.update({
          [preStatus]: sequelize.literal(`\`${preStatus}\` - 1`),
        }, {
          where: _.merge({}, f, {day: preUpdatedAt}),
          transaction: options.transaction
        }).then(() => {
          return Stats.update({
            [status]: sequelize.literal(`\`${status}\` + 1`),
          }, {
            where: _.merge({}, f, {day: updatedAt}),
            transaction: options.transaction
          }).then((nn) => {
            if (_.first(nn)){
              return
            }

            return Stats.create(_.merge({}, f, {
              day: updatedAt,
              [status]: 1
            }), {transaction: options.transaction})
          })
        })

        //skip for now
        return Stats.findOne({
          where: _.merge({}, f, {day: preUpdatedAt}),

          // lock: options.transaction.LOCK.SHARE,
          transaction: options.transaction,
        }).then((n) => {
          if (updatedAt == preUpdatedAt && n){
            return Promise.all([
              n.decrement(preStatus, {transaction: options.transaction}),
              n.increment(status, {transaction: options.transaction})
            ])
          }

          const promiseList = []
          if (n){
            promiseList.push(n.decrement(preStatus, {transaction: options.transaction}))
          }

          const fr = Stats.increment(status, {
            where: _.merge({}, f, {day: updatedAt}),
            transaction: options.transaction
          }).then((nn) => {
            if (_.last(_.first(nn))){
              return
            }

            return Stats.create(_.merge({}, f, {
              day: updatedAt,
              [status]: 1
            }), {transaction: options.transaction})
          })

          // const fr = Stats.upsert(_.merge({}, f, {day: updatedAt}), {
          //   transaction: options.transaction
          // }).then(() => {
          //   return Stats.findOne({
          //     where: _.merge({}, f, {day: updatedAt}),
          //     transaction: options.transaction
          //   }).then((nn) => {
          //     return nn.increment(status, {transaction: options.transaction})
          //   })
          // })

          // const fr = Stats.findOrCreate({
          //   where: _.merge({}, f, {day: updatedAt}),
          //
          //   // lock: options.transaction.LOCK.UPDATE,
          //   transaction: options.transaction
          // }).spread((nn, created) => {
          //   return nn.increment(status, {transaction: options.transaction})
          // })

          promiseList.push(fr)
          return Promise.all(promiseList)
        })
      },

      afterDestroy: function(m, options){
        logger.info("task afterDestroy")

        if (!_.includes([STATUS.undo, STATUS.delivered], m.status)){
          return
        }

        const status = _.findKey(STATUS, nn => nn == m.status)

        return Stats.update({
          [status]: sequelize.literal(`\`${status}\` - 1`),
        } , {
          where: {
            scriptId: m.scriptId,
            projectId: m.projectId,
            day: moment(m.updatedAt).startOf("hours").toDate(),
          },
          transaction: options.transaction,
        })
      },
    },

    scopes: {
      undo: {
        where: {status: STATUS.undo}
      },

      delivered: {
        where: {status: STATUS.delivered}
      },

      succeed: {
        where: {status: STATUS.succeed}
      },

      failed: {
        where: {status: STATUS.failed}
      },

      unmanaged: {
        where: {
          status: STATUS.delivered,
          updatedAt: {$lt: moment().subtract(1, 'hours').toDate()}
        },
      },

      expired: {
        where: {
          status: STATUS.undo,
          expiredAt: { $lte: moment().toDate() }
        }
      },
    }
  });

  task.associate = function(models){
    task.belongsTo(models.project)
    task.belongsTo(models.script)
  }

  task.getStatus = function(){
    return STATUS
  }

  task.prototype.deliver = function (opt){
    if (this.status == STATUS.delivered){
      throw `task id: ${this.id} is delivered`
    }

    this.status = STATUS.delivered
    return this.save(opt)
  }

  task.prototype.success = function (result, opt){
    return bluebird.resolve().then(() => {
      if (!result){
        return bluebird.resolve()
      }

      return this.getScript(opt).then((s) => {
        const extData = {
          "@createdAt": new Date() * 1,
          "@url": this.url,
          "@context": this.context
        }

        return s.saveResult(_.merge(extData, _.isArray(result) ? {data: result} : result), opt)
      })
    }).then(() => {
      if (this.status == STATUS.succeed){
        logger.warn(`task id: ${this.id} is succeed`)
        return
      }

      this.status = STATUS.succeed
      return this.save(opt)
    })
  }

  task.prototype.fail = function (message, opt){
    if (this.attempts >= 2){
      this.status = STATUS.failed
    }else{
      this.status = STATUS.undo
      this.attempts += 1
    }

    return Promise.all([
      this.getScript(opt).then((s) => {
        return s.saveError({
          "@createdAt": new Date() * 1,
          "@url": this.url,
          "@context": this.context,
          message: message
        })
      }),
      this.save(opt)
    ])
  }

  task.prototype.reset = function (attempts, opt){
    this.status = STATUS.undo
    this.attempts = attempts
    return this.save(opt)
  }

  return task;
};
