'use strict';
module.exports = (sequelize, DataTypes) => {
  const aula = sequelize.define('aula', {
    nombre: DataTypes.STRING
  }, {});
  return aula;
};