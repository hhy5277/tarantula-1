'use strict';

module.exports = (sequelize, DataTypes) => {
  var project = sequelize.define('project', {
    name: {
      type: DataTypes.STRING(144),
      validate: {
        isEven(v){
          var rg1 = /^[^\\\/:\*\?"<>\|%\^\$#]+$/
          var rg2 = /^\./
          var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i

          if (!rg1.test(v) || rg2.test(v) || rg3.test(v)){
            throw "the project name is illegal"
          }
        }
      }
    },
    seedScriptId: DataTypes.INTEGER.UNSIGNED,
    description: DataTypes.STRING,
    cron: DataTypes.STRING(20),
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
          lock: _.get(options.transaction, "LOCK.UPDATE"),
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
    // project.hasMany(models.task, {scope: {status: 'failed'}, as: "failedTasks"})

    // project.hasOne(models.script, {/*foreignKey: 'seedScriptId'*/ sourceKey: 'seedScriptId'})
    // project.hasOne(models.script, {sourceKey: 'seedScriptId'})
  }

  project.getUndoTasks = async () => {
    const t = await sequelize.transaction({
      // isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    })

    try{
      const undoList = _.chain(await Stats.findAll({
        include: [{
          model: Script,
          attributes: ['name', 'md5'],
        }],
        attributes: ['undo', 'scriptId'],
        where: {undo: {$gt: 0}},
        transaction: t,
        raw: true,
      })).groupBy((n) => {
        return n.scriptId
      }).map((items, scriptId) => {
        return {
          scriptId: scriptId,
          undo: _.sumBy(items, "undo"),
          scriptName: _.first(items)['script.name'],
          md5: _.first(items)['script.md5']
        }
      }).value()

      const maxCount = SETTINGS.fetch_max_task_count || 100
      const num = parseInt(maxCount / undoList.length)

      const tasks = await bluebird.map(undoList, async (n) => {
        const m = await Task.scope("undo").findAll({
          where: {scriptId: n.scriptId},

          offset: parseInt(_.max([0, n.undo - num]) * Math.random()),
          limit: num,

          lock: t.LOCK.UPDATE,
          transaction: t,
        })

        return await bluebird.mapSeries(m, (mm) => {
          return mm.deliver({transaction: t}).then(() => {
            return _.chain(mm.get()).merge({
              scriptName: n.scriptName,
              md5: n.md5,
            }).pick(['id', 'attempts', 'url', 'context', 'scriptName', 'md5']).value()
          })
        })
      })

      await t.commit()

      return _.chain(tasks).flatten().shuffle().value()
    }catch(e){
      logger.error(e)

      await t.rollback()

      throw e
    }
  }

  project.prototype.getUniqName = function(){
    return `${this.id}-${this.name}`
  }

  project.prototype.createScripts = function (files, opt){
    return bluebird.mapSeries(files, (n) => {
      return Script.create({
        projectId: this.id,
        name: n.name,
        code: n.content,
      }, opt).then((s) => {
        if (n.name == 'main.js' || n.isSeed){
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

  project.prototype.getStatsInfo = function (opt){
    return bluebird.resolve(this.getStats(opt)).then((s) => {
      return [
        _.sumBy(s, (n) => {
          return n.undo + n.delivered + n.succeed + n.failed
        }),
        _.sumBy(s, (n) => {
          return n.undo + n.delivered
        })
      ]
    }).spread((t, f) => {
      return _.merge({}, this.get(), {
        progress: t == 0 ? 0 : Number(((t - f) / t * 100).toFixed(1))
      })
    }).then((n) => {
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
  }

  project.prototype.getStatsBy = function (span, opt){
    return bluebird.resolve(this.getStats({
      include: [{
        model: Script,
        attributes: ["name"],
      }],
      raw: true,
    })).then((ss) => {
      return _.chain(ss).filter((s) => s['script.name']).groupBy((s) => {
        return JSON.stringify({
          day: moment(s.day).startOf(span).toDate() * 1,
          name: this.name,
          scriptName: s['script.name']
        })
      }).map((items, k) => {
        const ctx = JSON.parse(k)

        return _.chain(Task.getStatus()).reduce((r, v, k) => {
          return _.set(r, [k], _.sumBy(items, k))
        }, {}).merge(ctx, {
          day: moment(ctx.day, "x").format("YYYY-MM-DD"),
        }).value()
      }).value()
    })
  }

  project.prototype.reset = function (attempts, opt){
    return bluebird.resolve(this.getTasks(_.merge({scope: "failed"}, opt))).mapSeries((n) => {
      return n.reset(attempts, opt)
    })
  }

  project.prototype.loadError = async function (){
    const s = _.first(await this.getScripts())

    return s.loadError()
  }

  return project;
};
