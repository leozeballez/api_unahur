'use strict';
module.exports = (sequelize, DataTypes) => {
  const materias = sequelize.define('materias', {
    nombre: DataTypes.STRING,
    id_aula: DataTypes.INTEGER
  }, {});

  materias.associate = function(models) {
    // associations can be defined here
    materias.belongsTo(models.aula
      ,{
        as : 'Aula-Relacionada',
        foreignKey: 'id_aula'
      })
  };
  return materias;
};