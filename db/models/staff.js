module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    staff_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    address_id: { type: DataTypes.SMALLINT, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    store_id: { type: DataTypes.SMALLINT, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: true },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    picture: { type: DataTypes.STRING, allowNull: true },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'staff',
  })
  Staff.associate = function(models) {
    // associations can be defined here
  }
  return Staff
}
