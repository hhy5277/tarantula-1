'use strict';

const md5 = require("../utilities/md5")

module.exports = (sequelize, DataTypes) => {
  var script = sequelize.define('script', {
    projectId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    code: DataTypes.TEXT,
    md5: DataTypes.STRING
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },

    hooks: {
      beforeSave: function(m, options){
        if (m.changed('code')){
          m.md5 = md5(m.code)
        }
      },

      afterDestroy: function(m, options){
        logger.info(`script afterDestroy`)

        return bluebird.resolve(m.getTasks({
          lock: options.transaction.LOCK.UPDATE,
          transaction: options.transaction
        })).map((n) => {
          return n.destroy({transaction: options.transaction})
        })              
      }
    },
  });

  script.associate = function (models){
    script.belongsTo(models.project)

    script.hasMany(models.task)
    script.hasMany(models.stats)
  }

  script.prototype.createTasks = async function (items){
    const t = await sequelize.transaction()

    try{
      await bluebird.mapSeries(items, (n) => {
        return Task.create(_.merge({}, n, {
          scriptId: this.id,
          projectId: this.projectId,
        }), {transaction: t})
      })

      await t.commit()
    }catch(e){
      logger.error(e)

      await t.rollback()

      throw e
    }
  }

  return script;
};
