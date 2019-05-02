module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    city_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    country_id: { type: DataTypes.SMALLINT, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'city',
  })
  City.associate = function(models) {
    // associations can be defined here
  }
  return City
}
