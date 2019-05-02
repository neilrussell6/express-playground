module.exports = (sequelize, DataTypes) => {
  const Rental = sequelize.define('Rental', {
    rental_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    rental_date: { type: DataTypes.DATE, allowNull: false },
    inventory_id: { type: DataTypes.INTEGER, allowNull: false },
    customer_id: { type: DataTypes.SMALLINT, allowNull: false },
    return_date: { type: DataTypes.DATE, allowNull: true },
    staff_id: { type: DataTypes.SMALLINT, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'rental',
  })
  Rental.associate = function(models) {
    // associations can be defined here
  }
  return Rental
}
