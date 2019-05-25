module.exports = (sequelize, DataTypes) => {
  const Film = sequelize.define('Film', {
    film_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    release_year: { type: DataTypes.INTEGER, allowNull: false },
    language_id: { type: DataTypes.SMALLINT, allowNull: false },
    rental_duration: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 3 },
    rental_rate: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 4.99 },
    length: { type: DataTypes.SMALLINT, allowNull: false },
    replacement_cost: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 19.99 },
    rating: { type: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17'), allowNull: false, defaultValue: 'G' },
    create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    special_features: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    fulltext: { type: DataTypes.STRING, allowNull: false },
  }, {
    timestamps: true,
    createdAt: 'create_date',
    updatedAt: 'last_update',
    underscored: true,
    freezeTableName: true,
    tableName: 'film',
  })
  Film.associate = () => {
    // associations can be defined here
    // TODO: film_actor
    // TODO: film_category
  }
  return Film
}
