const R = require('ramda')
const Bluebird = require('bluebird')

const DbUtils = require('./db.utils')
const RequestUtils = require('../../../common/http/request.utils')
const ResponseUtils = require('../../../common/http/response.utils')
const {
  API_ENDPOINT_CUSTOMERS,
  CUSTOMER_QUERY_PARAM_CONFIG,
  CUSTOMER_KEY_MAP,
  CUSTOMER_BASE_PARAMS,
} = require('./constants')

//-----------------------------------------
// get customers
//-----------------------------------------

const getCustomers = queryParams => Bluebird
  .resolve(queryParams)
  .then(RequestUtils.extractQueryParams(CUSTOMER_QUERY_PARAM_CONFIG, CUSTOMER_KEY_MAP))
  .then(params => Bluebird
    .resolve(params)
    .then(DbUtils.getCustomers(CUSTOMER_BASE_PARAMS))
    // .delay(1000) // delay hack
    // .then(() => ({ rows: [], count: 0 })) // no data hack
    .then(({ rows, count }) => ResponseUtils
      .buildPaginationResponse(
        API_ENDPOINT_CUSTOMERS,
        CUSTOMER_BASE_PARAMS,
        params,
        CUSTOMER_QUERY_PARAM_CONFIG,
        rows,
        count,
      )
    )
    .then(R.evolve({
      data: R.map(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP)),
    }))
  )

module.exports.getCustomers = getCustomers

//-----------------------------------------
// get customer
//-----------------------------------------

const getCustomer = pk => Bluebird
  .resolve(pk)
  .then(DbUtils.getCustomer)
  .then(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP))
  .then(R.objOf('data'))

module.exports.getCustomer = getCustomer

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
  .resolve(data)
  // TODO: move this to DbUtils (it's specifically transforming for DB compatibility
  .then(RequestUtils.transformRequestBody(CUSTOMER_KEY_MAP))
  .then(DbUtils.createCustomer)
  .then(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP))
  .then(R.objOf('data'))

module.exports.createCustomer = createCustomer

//-----------------------------------------
// update customer
//-----------------------------------------

const updateCustomer = (pk, data) => Bluebird
  .resolve(data)
  .then(RequestUtils.transformRequestBody(CUSTOMER_KEY_MAP))
  .then(DbUtils.updateCustomer(pk))
  .then(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP))
  .then(R.objOf('data'))

module.exports.updateCustomer = updateCustomer

//-----------------------------------------
// delete customer
//-----------------------------------------

const deleteCustomer = pk => Bluebird
  .resolve(pk)
  .then(DbUtils.deleteCustomer)

module.exports.deleteCustomer = deleteCustomer
