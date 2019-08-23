'use strict';
module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    name: DataTypes.STRING,
    teacherId: DataTypes.INTEGER,
    name2: DataTypes.STRING,
    name3: DataTypes.STRING
  }, {});
  Genre.associate = function(models) {
    // associations can be defined here
  };
  return Genre;
};