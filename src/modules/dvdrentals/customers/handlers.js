const R = require('ramda')
const Bluebird = require('bluebird')

const { API_ENDPOINT_CUSTOMERS } = require('./constants')
const DbUtils = require('./db.utils')
const RequestUtils = require('../../../common/http/request.utils')
const ResponseUtils = require('../../../common/http/response.utils')
const { QUERY_PARAM_CONFIG, RESPONSE_MAP } = require('./constants')

//-----------------------------------------
// get customers
//-----------------------------------------

const getCustomers = queryParams => Bluebird
  .resolve(queryParams)
  .then(RequestUtils.extractQueryParams(QUERY_PARAM_CONFIG))
  .then(config => Bluebird
    .resolve(R.prop(config.sortField, R.invertObj(RESPONSE_MAP)))
    .then(sortField => DbUtils.getCustomers(sortField, config.sortDirection, config.pageSize, config.pageNumber))
    // .delay(1000) // delay hack
    // .then(() => ({ rows: [], count: 0 })) // no data hack
    .then(({ rows, count }) => ResponseUtils
      .buildPaginationResponse(API_ENDPOINT_CUSTOMERS, queryParams, QUERY_PARAM_CONFIG, config.pageNumber, config.pageSize, rows, count))
    .then(R.evolve({
      data: R.map(ResponseUtils.transformResponse(RESPONSE_MAP)),
    }))
  )

module.exports.getCustomers = getCustomers

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => DbUtils
    .createCustomer(data)
    .then(ResponseUtils.transformResponse(RESPONSE_MAP))

module.exports.createCustomer = createCustomer
