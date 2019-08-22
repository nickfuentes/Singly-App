'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   queryInterface.addColumn(
     'Teachers', 'imageurl', {
       type: Sequelize.STRING
     }
   )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Teachers', 'imageurl'
    )
  }
};
