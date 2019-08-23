'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Teachers',
      'rate',{
      type: Sequelize.STRING
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Teachers',
      'rate'
    )
  }
};
