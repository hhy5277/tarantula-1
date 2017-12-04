'use strict';

module.exports = (sequelize, DataTypes) => {
  var project = sequelize.define('project', {
    name: DataTypes.STRING,
    seedScriptId: DataTypes.INTEGER,
    description: DataTypes.STRING,
    cron: DataTypes.STRING,
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },

    scopes: {
      cron: {
        where: {cron: {$gt: ""}}
      }
    },

    hooks: {
      afterDestroy: function(m, options){
        logger.info(`project afterDestroy`)

        return bluebird.resolve(m.getScripts({
          lock: options.transaction.LOCK.UPDATE,
          transaction: options.transaction
        })).map((n) => {
          return n.destroy({transaction: options.transaction})
        })
      }
    }
  });

  project.associate = function(models){
    project.hasMany(models.task)
    project.hasMany(models.stats)
    project.hasMany(models.script)

    project.belongsTo(models.script, {foreignKey: 'seedScriptId', as: "seedScript"})
    // project.hasOne(models.script, {/*foreignKey: 'seedScriptId'*/ sourceKey: 'seedScriptId'})
    // project.hasOne(models.script, {sourceKey: 'seedScriptId'})
  }

  project.getUndoTasks = async () => {
    const t = await sequelize.transaction({
      // isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    })

    try{
      const undoList = await Stats.findAll({
        include: [{
          model: Script,
          attributes: ['name', 'md5'],
        }],
        attributes: ['undo', 'scriptId'],
        where: {undo: {$gt: 0}},
        transaction: t,
        raw: true,
      })

      const maxCount = SETTINGS.fetch_max_task_count || 100
      const num = parseInt(maxCount / undoList.length)

      const tasks = await Promise.all(_.map(undoList, async (n) => {
        const m = await Task.scope("undo").findAll({
          where: {scriptId: n.scriptId},

          offset: parseInt(_.max([0, n.undo - num]) * Math.random()),
          limit: num,

          lock: t.LOCK.UPDATE,
          transaction: t,
        })

        return await bluebird.mapSeries(m, (mm) => {
        //return await Promise.all(_.map(m, (mm) => {
          return mm.deliver({transaction: t}).then(() => {
            return _.chain(mm.get()).merge({
              scriptName: n["script.name"],
              md5: n["script.md5"]
            }).pick(['id', 'attempts', 'url', 'context', 'scriptName', 'md5']).value()
          })
        })
      }))

      await t.commit()

      return {
        tasks: _.chain(tasks).flatten().shuffle().value()
      }
    }catch(e){
      logger.error(e)

      await t.rollback()

      throw e
    }
  }

  project.prototype.createScripts = function (files, opt){
    return bluebird.mapSeries(files, (n) => {
      return Script.create({
        projectId: this.id,
        name: n.name,
        code: n.content,
      }, opt).then((s) => {
        if (n.isSeed){
          this.seedScriptId = s.id
          return this.save(opt)
        }
      })
    })
  }

  project.prototype.createSeedTask = function (opt){
    return this.getSeedScript(opt).then((s) => {
      return s.createTask({}, opt)
    })
  }

  return project;
};
