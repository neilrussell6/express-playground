const models = require('../db/models/index')

// this solves models.sequelize.sync causing mocha to never finish
after(() => (
  models.sequelize.close()
))
