
const Bluebird = require('bluebird')
const R = require('ramda')

const { DoesNotExistError } = require('../../../common/db/db.errors')
const PaginateUtils = require('../../../common/db/paginate.utils')
const models = require('../../../../db/models/index')
const {
  CUSTOMER_PRIMARY_KEY,
  ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST,
} = require('./constants')

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
  .then(R.ifElse(
    R.isNil,
    () => Bluebird.reject(new DoesNotExistError(ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST)),
    R.prop('dataValues'),
  ))

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

const updateCustomer = pk => data => Bluebird
  .resolve(pk)
  .then(x => models.Customer.update(data, {
    where: {
      [CUSTOMER_PRIMARY_KEY]: x,
    },
    returning: true,
  }))
  .then(([updatedRowCount, updatedRows]) => R.ifElse(
    R.equals(0),
    () => Bluebird.reject(new DoesNotExistError(ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST)),
    R.always(R.compose(R.prop('dataValues'), R.head)(updatedRows)),
  )(updatedRowCount))

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
  .then(R.ifElse(
    R.equals(0), // deletedRowCount
    () => Bluebird.reject(new DoesNotExistError(ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST)),
    R.always(null),
  ))

module.exports.deleteCustomer = deleteCustomer
