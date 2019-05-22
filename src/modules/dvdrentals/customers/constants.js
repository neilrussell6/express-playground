const { queryParamTypes } = require('../../../common/http/request.utils')

const {
  ENUM_KEYS_VALUES,
  ENUM_KEYS,
  INT,
} = queryParamTypes
const PRIMARY_KEY = 'customer_id'
const REQUEST_BODY_KEY_MAP = {
  id: 'customer_id',
  address: 'address_id',
  store: 'store_id',
  active: 'activebool',
  email: 'email',
  firstName: 'first_name',
  lastName: 'last_name',
  created: 'create_date',
}
const FILTER_KEYS = ['active', 'email', 'firstName', 'lastName', 'created']
const SORT_KEYS = ['active', 'email', 'firstName', 'lastName', 'created']
const SORT_VALUES = ['ASC', 'DESC']

const QUERY_PARAM_CONFIG = [
  // <path>[<SORT_KEYS>]=<SORT_VALUES> eg. path = ['sort', 'by', 'some'] ~ sort[by][some][firstName]=DESC ~ { sorting: { firstName: 'DESC' }
  { key: 'sorting', path: ['sort'], type: ENUM_KEYS_VALUES, keys: SORT_KEYS, values: SORT_VALUES },
  // <path>[<FILTER_KEYS>]=<any value> eg. path = ['filter', 'by', 'some'] ~ filter[by][some][firstName]=anna ~ { filtering: { firstName: 'anna' } }
  { key: 'filtering', path: ['filter'], type: ENUM_KEYS, keys: FILTER_KEYS },
  // <path>=<INTEGER> eg. path = ['page', 'number'] ~ page[number]=123 ~ { pageNumber: 123 }
  { key: 'pageNumber', path: ['page', 'number'], type: INT },
  // <path>=<INTEGER> eg. path = ['page', 'size'] ~ page[size]=123 ~ { pageSize: 123 }
  { key: 'pageSize', path: ['page', 'size'], type: INT },
]

const BASE_PARAMS = {
  pageNumber: 1,
  pageSize: 10,
  sorting: { [PRIMARY_KEY]: 'ASC'},
}

API_ENDPOINT_CUSTOMERS = `${process.env.API_URL}/customers`

module.exports = {
  PRIMARY_KEY,
  REQUEST_BODY_KEY_MAP,
  FILTER_KEYS,
  SORT_KEYS,
  SORT_VALUES,
  QUERY_PARAM_CONFIG,
  BASE_PARAMS,
  API_ENDPOINT_CUSTOMERS,
}
