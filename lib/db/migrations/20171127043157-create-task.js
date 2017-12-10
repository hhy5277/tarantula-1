'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      url: {
        type: Sequelize.STRING(2048)
      },
      scriptId: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      projectId: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      status: {
        type: Sequelize.TINYINT,
      },
      attempts: {
        type: Sequelize.TINYINT,
        defaultValue: 0
      },
      context: {
        type: Sequelize.STRING(1024)
      },
      expiredAt: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('tasks');
  }
};
