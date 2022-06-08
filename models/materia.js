'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_aula: DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    // associations can be defined here
    materia.hasMany(models.aula
      ,{
        as : 'Aula-Relacionada',
        foreignKey: 'id_aula'
      })
  };
  return materia;
};