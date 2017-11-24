'use strict';
module.exports = (sequelize, DataTypes) => {
  var script = sequelize.define('script', {
    name: DataTypes.STRING,
    code: DataTypes.TEXT,
    md5: DataTypes.STRING,
    status: DataTypes.ENUM("valid", "invalid"),
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return script;
};
