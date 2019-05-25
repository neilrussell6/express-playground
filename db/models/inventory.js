module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    inventory_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    film_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'film',
  })
  Inventory.associate = () => {
    // associations can be defined here
  }
  return Inventory
}
