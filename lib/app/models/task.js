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
      defaultValue: () => moment().endOf('day').toDate(),
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

        const day = moment(m.createdAt).startOf("day").toDate()

        return Stats.findOne({
          where: {
            scriptId: m.scriptId,
            day: day,
            projectId: m.projectId,
          },
          transaction: options.transaction
        }).then((n) => {
          if (_.isNil(n)){
            return Stats.create({
              projectId: m.projectId,
              scriptId: m.scriptId,
              day: day,
              undo: 1
            }, {transaction: options.transaction})
          }else{
            return n.increment(["undo"], {transaction: options.transaction})
          }
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

        return Stats.findOne({where: _.merge({}, f, {day: preUpdatedAt}), transaction: options.transaction}).then((n) => {
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

          const fr = Stats.findOne({where: _.merge({}, f, {day: updatedAt}), transaction: options.transaction}).then((nn) => {
            if (nn){
              return n.increment(status, {transaction: options.transaction})
            }else{
              return Stats.create(_.merge({}, f, {
                day: updatedAt,
                [status]: 1
              }), {transaction: options.transaction})
            }
          })

          promiseList.push(fr)
          return promiseList
        })
      },

      afterDestroy: function(m, options){
        logger.info("task afterDestroy")

        if (!_.includes(['undo', 'delivered'], m.status)){
          return
        }

        return Stats.findOne({
          where: {
            scriptId: m.scriptId,
            projectId: m.projectId,
            day: moment(m.updatedAt).startOf("day").toDate(),
          },
          transaction: options.transaction
        }).then((n) => {
          if (n){
            return n.decrement(m.status, {transaction: options.transaction})
          }
        })
      },
    },

    scopes: {
      undo: {
        where: {status: 'undo'}
      },
    }
  });

  task.associate = function(models){
    task.belongsTo(models.project)
    task.belongsTo(models.script)
  }

  task.prototype.deliver = function (opt){
    this.status = 'delivered'
    return this.save(opt)
  }

  task.prototype.succee = function (opt){
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
    this.attempts = 0
    return this.save(opt)
  }

  return task;
};
