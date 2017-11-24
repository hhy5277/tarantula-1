'use strict';
module.exports = (sequelize, DataTypes) => {
  var proxy = sequelize.define('proxy', {
    ip: DataTypes.STRING,
    port: DataTypes.TINYINT,
    category: DataTypes.ENUM('http', 'https', 'socks4', 'socks5'),
    statue: DataTypes.ENUM("valid", "invalid"),
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
    }
  });
  return proxy;
};
