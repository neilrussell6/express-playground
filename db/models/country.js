module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    country_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'country',
  })
  Country.associate = () => {
    // associations can be defined here
  }
  return Country
}
