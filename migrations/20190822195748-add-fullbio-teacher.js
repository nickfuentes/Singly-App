'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Teachers',
      'fullBio',{
      type: Sequelize.TEXT
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Teachers',
      'fullBio'
    )
  }
};

