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

        return m.getScripts({transaction: options.transaction}).then((s) => {
          return Promise.all(_.map(s, (n) => {
            return n.destroy({transaction: options.transaction})
          }))
        })
      }
    }
  });

  project.associate = function(models){
    project.hasMany(models.task)
    project.hasMany(models.script)

    project.belongsTo(models.script, {foreignKey: 'seedScriptId', as: "seedScript"})
    // project.hasOne(models.script, {/*foreignKey: 'seedScriptId'*/ sourceKey: 'seedScriptId'})
    // project.hasOne(models.script, {sourceKey: 'seedScriptId'})
  }

  project.fuckAll = function(){
    return this.findAll({})
  }

  return project;
};
