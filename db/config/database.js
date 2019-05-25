const dbConfig = {
  // database
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  // seeder
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeSeedMeta',
}

module.exports = {
  development: {
    ...dbConfig,
    logging: query => console.log(query), // eslint-disable-line no-console
  },
  staging: {
    ...dbConfig,
    logging: query => console.log(query), // eslint-disable-line no-console
  },
  production: {
    ...dbConfig,
    logging: () => null,
  },
  test: {
    ...dbConfig,
    logging: () => null,
    // logging: x => console.log(x),
  },
}
