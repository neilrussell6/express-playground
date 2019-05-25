module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    language_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'language',
  })
  Language.associate = () => {
    // associations can be defined here
  }
  return Language
}
