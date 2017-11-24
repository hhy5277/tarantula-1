'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('scripts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },      
      code: {
        type: Sequelize.TEXT
      },
      md5: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('scripts');
  }
};
