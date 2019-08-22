'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint(
      'Genres',['teacherId'],{type:'FOREIGN KEY',references:{table:'Teachers',field: 'id',name:'add-fk-to-genre'}}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(
      'Genres','add-fk-to-genre'
    )
  }
};
