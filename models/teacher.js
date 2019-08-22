'use strict';
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    username: DataTypes.STRING,
    location: DataTypes.STRING,
    yearsExperience: DataTypes.INTEGER,
    password: DataTypes.STRING,
    calendlyUrl: DataTypes.STRING,
<<<<<<< HEAD
    imageurl: DataTypes.STRING,
=======
>>>>>>> e9f02ba5b919c77e86629183849c91ae5ee62b8a
    bio:DataTypes.STRING
  }, {});
  Teacher.associate = function(models) {
    models.Teacher.hasMany(models.Genre,{as:'genres',foreignKey:'teacherId'})
  };
  return Teacher;
};