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
    },

    hooks: {
      afterDestroy: function(m, options){
        logger.info(`script afterDestroy`)

        return m.getTasks({transaction: options.transaction}).then((tasks) => {
          return Promise.all(_.map(tasks, (n) => {
            return n.destroy({transaction: options.transaction})
          }))
        })
      }
    },
  });

  script.associate = function(models){
    script.belongsTo(models.project)

    script.hasMany(models.task)
    script.hasMany(models.stats)
  }

  return script;
};
