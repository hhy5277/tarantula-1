'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('nodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      ip: {
        type: Sequelize.STRING(32),
      },
      succeed:{
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      failed:{
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
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
    return queryInterface.dropTable('nodes');
  }
};
