const R = require('ramda')
const Bluebird = require('bluebird')

const DbUtils = require('./db.utils')
const RequestUtils = require('../../../common/http/request.utils')
const ResponseUtils = require('../../../common/http/response.utils')
const {
  API_ENDPOINT_CUSTOMERS,
  QUERY_PARAM_CONFIG,
  REQUEST_BODY_KEY_MAP,
  PRIMARY_KEY,
  BASE_PARAMS,
} = require('./constants')

//-----------------------------------------
// get customers
//-----------------------------------------

const getCustomers = queryParams => Bluebird
  .resolve(queryParams)
  .then(RequestUtils.extractQueryParams(QUERY_PARAM_CONFIG, REQUEST_BODY_KEY_MAP))
  .then(queryParams => Bluebird
    .resolve(queryParams)
    .then(DbUtils.getCustomers(BASE_PARAMS))
    // .delay(1000) // delay hack
    // .then(() => ({ rows: [], count: 0 })) // no data hack
    .then(({ rows, count }) => ResponseUtils
      .buildPaginationResponse(API_ENDPOINT_CUSTOMERS, BASE_PARAMS, queryParams, QUERY_PARAM_CONFIG, rows, count))
    .then(R.evolve({
      data: R.map(ResponseUtils.transformResponse(REQUEST_BODY_KEY_MAP)),
    }))
  )

module.exports.getCustomers = getCustomers

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
  .resolve(data)
  .then(R.mergeRight({ store: 1, address: 1 }))
  .then(RequestUtils.transformRequestBody(R.invertObj(REQUEST_BODY_KEY_MAP)))
  .then(x => DbUtils
    .createCustomer(x)
    .then(ResponseUtils.transformResponse(REQUEST_BODY_KEY_MAP))
  )

module.exports.createCustomer = createCustomer

//-----------------------------------------
// update customer
//-----------------------------------------

const updateCustomer = (id, data) => Bluebird
  .resolve(R.mergeRight({ id }, data))
  .then(RequestUtils.transformRequestBody(REQUEST_BODY_KEY_MAP))
  .then(data => Bluebird
    .resolve(data)
    .then((data) => DbUtils
      .updateCustomer(PRIMARY_KEY, parseInt(R.prop(PRIMARY_KEY, data), 10), R.omit(PRIMARY_KEY, data))
      .then(ResponseUtils.transformResponse(REQUEST_BODY_KEY_MAP))
    )
  )

module.exports.updateCustomer = updateCustomer
