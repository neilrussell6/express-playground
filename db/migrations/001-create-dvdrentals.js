const { DataTypes } = require('sequelize')
const Bluebird = require('bluebird')

module.exports = {
  up: (queryInterface, sequelize) => Bluebird
    .resolve(
      queryInterface.createTable('customer', {
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
      })
    )
    .then(() => queryInterface.createTable('actor', {
      actor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('category', {
      category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('film', {
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
    }))
    .then(() => queryInterface.createTable('film_actor', {
      actor_id: { type: DataTypes.INTEGER, allowNull: false },
      film_id: { type: DataTypes.INTEGER, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('film_category', {
      film_id: { type: DataTypes.INTEGER, allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('address', {
      address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      address2: { type: DataTypes.STRING, allowNull: true },
      district: { type: DataTypes.STRING, allowNull: false },
      city_id: { type: DataTypes.SMALLINT, allowNull: false },
      postal_code: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('city', {
      city_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      country_id: { type: DataTypes.SMALLINT, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('country', {
      country_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('inventory', {
      inventory_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      film_id: { type: DataTypes.INTEGER, allowNull: false },
      store_id: { type: DataTypes.INTEGER, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('language', {
      language_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('payment', {
      payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      staff_id: { type: DataTypes.INTEGER, allowNull: false },
      rental_id: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      payment_date: { type: DataTypes.DATE, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('rental', {
      rental_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      rental_date: { type: DataTypes.DATE, allowNull: false },
      inventory_id: { type: DataTypes.INTEGER, allowNull: false },
      customer_id: { type: DataTypes.SMALLINT, allowNull: false },
      return_date: { type: DataTypes.DATE, allowNull: true },
      staff_id: { type: DataTypes.SMALLINT, allowNull: false },
      create_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .then(() => queryInterface.createTable('staff', {
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
    }))
    .then(() => queryInterface.createTable('store', {
      store_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      manager_staff_id: { type: DataTypes.SMALLINT, allowNull: false },
      address_id: { type: DataTypes.SMALLINT, allowNull: false },
      last_update: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.fn('NOW') },
    }))
    .catch(e => console.log(e)), // eslint-disable-line no-console

  down: queryInterface => Bluebird
    .resolve(queryInterface.dropTable('customer'))
    .then(() => queryInterface.dropTable('actor'))
    .then(() => queryInterface.dropTable('category'))
    .then(() => queryInterface.dropTable('film'))
    .then(() => queryInterface.dropTable('film_actor'))
    .then(() => queryInterface.dropTable('film_category'))
    .then(() => queryInterface.dropTable('address'))
    .then(() => queryInterface.dropTable('city'))
    .then(() => queryInterface.dropTable('country'))
    .then(() => queryInterface.dropTable('inventory'))
    .then(() => queryInterface.dropTable('language'))
    .then(() => queryInterface.dropTable('payment'))
    .then(() => queryInterface.dropTable('rental'))
    .then(() => queryInterface.dropTable('staff'))
    .then(() => queryInterface.dropTable('store'))
    .catch(e => console.log(e)), // eslint-disable-line no-console
}
