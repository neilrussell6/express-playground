module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    address2: { type: DataTypes.STRING, allowNull: true },
    district: { type: DataTypes.STRING, allowNull: false },
    city_id: { type: DataTypes.SMALLINT, allowNull: false },
    postal_code: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'address',
  })
  Address.associate = function(models) {
    // associations can be defined here
  }
  return Address
}
