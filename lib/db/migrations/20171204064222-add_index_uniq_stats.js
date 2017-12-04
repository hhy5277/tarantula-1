'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('stats', {
      fields: ['projectId', 'scriptId', 'day'],
      unique: true,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('stats', ['projectId', 'scriptId', 'day'])
  }
};
