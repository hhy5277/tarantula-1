'use strict';
module.exports = (sequelize, DataTypes) => {
  var node = sequelize.define('node', {
    ip: DataTypes.STRING(32),
    failed: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    succeed: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return node;
};
