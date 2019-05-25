module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    store_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    manager_staff_id: { type: DataTypes.SMALLINT, allowNull: false },
    address_id: { type: DataTypes.SMALLINT, allowNull: false },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'store',
  })
  Store.associate = () => {
    // associations can be defined here
  }
  return Store
}
