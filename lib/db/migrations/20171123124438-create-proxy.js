'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('proxies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ip: {
        type: Sequelize.STRING
      },
      port: {
        type: Sequelize.TINYINT
      },
      category: {
        type: Sequelize.ENUM,
        values: ['http', 'https', 'socks4', 'socks5'],
        defaultValue: 'http'
      },
      status: {
        type: Sequelize.ENUM,
        values: ['valid', 'invalid'],
        defaultValue: 'invalid'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('proxies');
  }
};
