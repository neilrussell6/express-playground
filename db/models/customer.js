module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    store_id: { type: DataTypes.SMALLINT, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    address_id: { type: DataTypes.SMALLINT, allowNull: false },
    activebool: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    active: { type: DataTypes.SMALLINT, allowNull: true },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'customer',
  })
  Customer.associate = function(models) {
    // associations can be defined here
  }
  return Customer
}
