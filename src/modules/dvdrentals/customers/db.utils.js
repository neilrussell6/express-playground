const R = require('ramda')
const Bluebird = require('bluebird')

const models = require('../../../../db/models/index')

//-----------------------------------------
// get customers
//-----------------------------------------

const paginate = (model, sortField, sortDirection, pageSize, pageNumber) => Bluebird
  .all([
    model.findAll({
      order: [ [sortField, sortDirection] ],
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
    }),
    model.count(),
  ])
  .then(R.zipObj(['rows', 'count']))

const getCustomers = (...args) => paginate(models.Customer, ...args)

module.exports.getCustomers = getCustomers

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
    .resolve(models.Customer.create(data))

module.exports.createCustomer = createCustomer
