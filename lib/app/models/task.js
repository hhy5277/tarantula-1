'use strict';

module.exports = (sequelize, DataTypes) => {
  var task = sequelize.define('task', {
    url: DataTypes.STRING,
    scriptId: DataTypes.INTEGER,
    projectId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ['undo', 'delivered', 'succeed', 'failed'],
      defaultValue: 'undo'
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
          day: moment(m.createdAt).startOf("day").toDate(),
          projectId: m.projectId,
        }

        return Stats.update({
          [m.status]: sequelize.literal(`\`${m.status}\` + 1`),
        } , {
          where: f,
          transaction: options.transaction,
        }).then((n) => {
          if (_.first(n)){
            return
          }

          return Stats.create(_.merge({}, f, {
            [m.status]: 1
          }), {transaction: options.transaction})
        })
      },

      afterUpdate: function(m, options){
        const [updatedAt, preUpdatedAt] = [
          moment(m.updatedAt).startOf("day").toDate(),
          moment(m.previous('updatedAt')).startOf("day").toDate()
        ]

        const [status, preStatus] = [m.status, m.previous('status')]

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

        if (!_.includes(['undo', 'delivered'], m.status)){
          return
        }

        return Stats.update({
          [m.status]: sequelize.literal(`\`${m.status}\` - 1`),
        } , {
          where: {
            scriptId: m.scriptId,
            projectId: m.projectId,
            day: moment(m.updatedAt).startOf("day").toDate(),
          },
          transaction: options.transaction,
        })
      },
    },

    scopes: {
      undo: {
        where: {status: 'undo'}
      },

      delivered: {
        where: {status: 'delivered'}
      },

      unmanaged: {
        where: {
          status: 'delivered',
          updatedAt: {$lt: moment().subtract(1, 'hours').toDate()}
        },
      },

      expired: {
        where: {
          status: 'undo',
          expiredAt: { $lte: moment().toDate() }
        }
      },
    }
  });

  task.associate = function(models){
    task.belongsTo(models.project)
    task.belongsTo(models.script)
  }

  task.prototype.deliver = function (opt){
    if (this.status == 'delivered'){
      throw `task id: ${this.id} is delivered`
    }

    this.status = 'delivered'
    return this.save(opt)
  }

  task.prototype.succee = function (opt){
    if (this.status == 'succeed'){
      throw `task id: ${this.id} is succeed`
    }

    this.status = 'succeed'
    return this.save(opt)
  }

  task.prototype.fail = function (opt){
    if (this.attempts >= 3){
      this.status = 'failed'
    }else{
      this.status = 'undo'
      this.attempts += 1
    }

    return this.save(opt)
  }

  task.prototype.reset = function (opt){
    this.status = 'undo'
    return this.save(opt)
  }


  task.prototype.saveResult = function (content, opt){
    const extData = {
      "@createdAt": new Date() * 1,
      "@url": this.url,
      "@context": this.context
    }

    let c;
    if (_.isArray(content)){
      c = _.merge({}, extData, {
        data: content
      })
    }else{
      c = _.merge({}, content, extData)
    }

    return this.getScript(opt).then((s) => {
      return s.saveResult(c, opt)
    })
  }

  return task;
};
