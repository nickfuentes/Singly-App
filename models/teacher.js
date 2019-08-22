'use strict';
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    username: DataTypes.STRING,
    location: DataTypes.STRING,
    yearsExperience: DataTypes.INTEGER,
    password: DataTypes.STRING,
    calendlyUrl: DataTypes.STRING,
    bio:DataTypes.STRING
  }, {});
  Teacher.associate = function(models) {
    models.Teacher.hasMany(models.Genre,{as:'genres',foreignKey:'teacherId'})
  };
  return Teacher;
};