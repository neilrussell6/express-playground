const R = require('ramda')
const Bluebird = require('bluebird')

const DbUtils = require('./db.utils')
const RequestUtils = require('../../../common/http/request.utils')
const ResponseUtils = require('../../../common/http/response.utils')
const {
  API_ENDPOINT_CUSTOMERS,
  CUSTOMER_QUERY_PARAM_CONFIG,
  CUSTOMER_KEY_MAP,
  CUSTOMER_PRIMARY_KEY,
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
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
  .resolve(data)
  .then(R.mergeRight({ store: 1, address: 1 }))
  .then(RequestUtils.transformRequestBody(R.invertObj(CUSTOMER_KEY_MAP)))
  .then(x => DbUtils
    .createCustomer(x)
    .then(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP))
  )

module.exports.createCustomer = createCustomer

//-----------------------------------------
// update customer
//-----------------------------------------

const updateCustomer = (id, data) => Bluebird
  .resolve(R.mergeRight({ id }, data))
  .then(RequestUtils.transformRequestBody(CUSTOMER_KEY_MAP))
  .then(x => DbUtils
    .updateCustomer(
      CUSTOMER_PRIMARY_KEY,
      parseInt(R.prop(CUSTOMER_PRIMARY_KEY, x), 10),
      R.omit(CUSTOMER_PRIMARY_KEY, x),
    )
    .then(ResponseUtils.transformResponse(CUSTOMER_KEY_MAP))
  )

module.exports.updateCustomer = updateCustomer
