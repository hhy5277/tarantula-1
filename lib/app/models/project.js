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
    }
  });

  project.associate = function(models){
    project.hasMany(models.task)

    project.hasOne(models.script, {/*foreignKey: 'seedScriptId'*/ sourceKey: 'seedScriptId'})
  }

  return project;
};
