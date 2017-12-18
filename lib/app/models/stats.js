'use strict';
module.exports = (sequelize, DataTypes) => {
  var stats = sequelize.define('stats', {
    scriptId: DataTypes.INTEGER.UNSIGNED,
    projectId: DataTypes.INTEGER.UNSIGNED,
    day: DataTypes.DATE,
    undo: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    delivered: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    succeed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  stats.associate = function(models){
    stats.belongsTo(models.script)
    stats.belongsTo(models.project)
  }

  return stats;
};
