const Bluebird = require('bluebird')

const PaginateUtils = require('../../../common/db/paginate.utils')
const models = require('../../../../db/models/index')

//-----------------------------------------
// get customers
//-----------------------------------------

const getCustomers = baseParams => config => PaginateUtils
  .paginate(models.Customer, 'customer_id', baseParams, config)

module.exports.getCustomers = getCustomers

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
    .resolve(models.Customer.create(data))

module.exports.createCustomer = createCustomer

//-----------------------------------------
// update customer
//-----------------------------------------

const updateCustomer = (pk, pkValue, data) => Bluebird
  .resolve(data)
  .then((where) => models.Customer.update(data, { where }))
  .then(([ id ]) => models.Customer.find({ where: { id } }))

module.exports.updateCustomer = updateCustomer
