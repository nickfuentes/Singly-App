'use strict';
module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    name: DataTypes.STRING,
    teacherId: DataTypes.INTEGER
  }, {});
  Genre.associate = function(models) {
    // associations can be defined here
  };
  return Genre;
};