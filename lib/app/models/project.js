'use strict';
module.exports = (sequelize, DataTypes) => {
  var project = sequelize.define('project', {
    name: DataTypes.STRING,
    scriptName: DataTypes.STRING,
    cron: DataTypes.STRING,
    status: DataTypes.ENUM('valid', 'invalid', 'deleted'),
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },

    scopes: {
      valid: {
        where: {status: 'valid'}
      },

      cron: {
        where: {cron: {$gt: ""}}
      }
    }
  });
  return project;
};
