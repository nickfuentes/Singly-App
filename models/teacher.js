'use strict';
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    username: DataTypes.STRING,
    location: DataTypes.STRING,
    yearsExperience: DataTypes.INTEGER,
    password: DataTypes.STRING,
    calendlyUrl: DataTypes.STRING
  }, {});
  Teacher.associate = function(models) {
    // associations can be defined here
  };
  return Teacher;
};