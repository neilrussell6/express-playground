const Bluebird = require('bluebird')
const R = require('ramda')

const PaginateUtils = require('../../../common/db/paginate.utils')
const models = require('../../../../db/models/index')
const { CUSTOMER_PRIMARY_KEY } = require('./constants')

//-----------------------------------------
// get customers
//-----------------------------------------

const getCustomers = baseParams => config => PaginateUtils
  .paginate(models.Customer, 'customer_id', baseParams, config)

module.exports.getCustomers = getCustomers

//-----------------------------------------
// get customer
//-----------------------------------------

const getCustomer = pk => Bluebird
  .resolve(pk)
  .then(x => models.Customer.findOne({
    where: {
      [CUSTOMER_PRIMARY_KEY]: x,
    },
  }))
  .then(R.prop('dataValues'))

module.exports.getCustomer = getCustomer

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
  .resolve(models.Customer.create(data))

module.exports.createCustomer = createCustomer

//-----------------------------------------
// update customer
//-----------------------------------------

const updateCustomer = (pk, data) => Bluebird
  .resolve(pk)
  .then(x => models.Customer.update(data, {
    where: {
      [CUSTOMER_PRIMARY_KEY]: x,
    },
  }))
  .then(() => models.Customer.findOne({
    where: {
      [CUSTOMER_PRIMARY_KEY]: pk,
    },
  }))
  .then(R.prop('dataValues'))

module.exports.updateCustomer = updateCustomer

//-----------------------------------------
// delete customer
//-----------------------------------------

const deleteCustomer = pk => Bluebird
  .resolve(pk)
  .then(x => models.Customer.destroy({
    where: {
      [CUSTOMER_PRIMARY_KEY]: x,
    },
  }))
  .then(R.always(null))

module.exports.deleteCustomer = deleteCustomer
