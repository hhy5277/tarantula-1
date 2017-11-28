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
      afterSave: function(task, options){
        logger.info("afterSave")
      },

      afterCreate: async function(task, options){
        logger.info(`afterCreate`)

        const day = moment(task.createdAt).startOf("day").toDate()
        const n = await Stats.findOne({where: {
          scriptId: task.scriptId,
          day: day,
          projectId: task.projectId,
        }}, {transaction: options.transaction})

        if (_.isNil(n)){
          await Stats.create({
            projectId: task.projectId,
            scriptId: task.scriptId,
            day: day,
            undo: 1
          }, {transaction: options.transaction})
        }else{
          await n.increment(["undo"], {transaction: options.transaction})
        }
      },

      afterUpdate: async function(task, options){
        logger.info(`afterUpdate`)

        const [updatedAt, preUpdatedAt] = [
          moment(task.updatedAt).startOf("day").toDate(),
          moment(task.previous('updatedAt')).startOf("day").toDate()
        ]

        const [status, preStatus] = [task.status, task.previous('status')]

        if (updatedAt == preUpdatedAt && status == perStatus){
          return
        }

        const f = {
          projectId: task.projectId,
          scriptId: task.scriptId,
        }

        let n = await Stats.findOne({where: _.merge({}, f, {day: preUpdatedAt})}, {transaction: options.transaction})
        if (updatedAt == preUpdatedAt){
          if (n){
            await n.decrement(perStatus)
            await n.increment(status)
          }
        }else{
          if (n){
            await n.decrement(perStatus)
          }

          n = await Stats.findOne({where: _.merge({}, f, {day: updatedAt})}, {transaction: options.transaction})
          if (n){
            await n.increment(status)
          }else{
            await Stats.create(_.merge({}, f, {
              day: updatedAt,
              [status]: 1
            }), {transaction: options.transaction})
          }
        }
      },

      afterDestroy: async function(task, options){
        logger.info("afterDestroy")

        if (!_.includes(['undo', 'delivered'], task.status)){
          return
        }

        const n = await Stats.findOne({where: {
          scriptId: task.scriptId,
          projectId: task.projectId,
          day: moment(task.updatedAt).startOf("day").toDate(),
        }}, {transaction: options.transaction})

        if (n) {
          await n.decrement(task.status, {transaction: options.transaction})
        }
      },
    }
  });

  task.associate = function(models){
    task.belongsTo(models.project)

    task.hasOne(models.script)
  }

  return task;
};
