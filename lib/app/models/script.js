'use strict';
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
    }
  });

  script.associate = function(models){
    script.belongsTo(models.project)
  }

  return script;
};
