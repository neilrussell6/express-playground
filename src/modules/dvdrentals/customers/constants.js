const { queryParamTypes } = require('../../../common/http/request.utils')

const {
  ENUM_KEYS_VALUES,
  ENUM_KEYS,
  INT,
} = queryParamTypes
const CUSTOMER_PRIMARY_KEY = 'customer_id'
const CUSTOMER_KEY_MAP = {
  id: 'customer_id',
  address: 'address_id',
  store: 'store_id',
  active: 'activebool',
  email: 'email',
  firstName: 'first_name',
  lastName: 'last_name',
  created: 'create_date',
}
const CUSTOMER_FILTER_KEYS = ['active', 'email', 'firstName', 'lastName', 'created']
const CUSTOMER_SORT_KEYS = ['active', 'email', 'firstName', 'lastName', 'created']
const CUSTOMER_SORT_VALUES = ['ASC', 'DESC']

const CUSTOMER_QUERY_PARAM_CONFIG = [
  // <path>[<CUSTOMER_SORT_KEYS>]=<CUSTOMER_SORT_VALUES> eg. path = ['sort', 'by', 'some'] ~ sort[by][some][firstName]=DESC ~ { sorting: { firstName: 'DESC' }
  { key: 'sorting', path: ['sort'], type: ENUM_KEYS_VALUES, keys: CUSTOMER_SORT_KEYS, values: CUSTOMER_SORT_VALUES },
  // <path>[<CUSTOMER_FILTER_KEYS>]=<any value> eg. path = ['filter', 'by', 'some'] ~ filter[by][some][firstName]=anna ~ { filtering: { firstName: 'anna' } }
  { key: 'filtering', path: ['filter'], type: ENUM_KEYS, keys: CUSTOMER_FILTER_KEYS },
  // <path>=<INTEGER> eg. path = ['page', 'number'] ~ page[number]=123 ~ { pageNumber: 123 }
  { key: 'pageNumber', path: ['page', 'number'], type: INT },
  // <path>=<INTEGER> eg. path = ['page', 'size'] ~ page[size]=123 ~ { pageSize: 123 }
  { key: 'pageSize', path: ['page', 'size'], type: INT },
]

const CUSTOMER_BASE_PARAMS = {
  pageNumber: 1,
  pageSize: 10,
  sorting: { [CUSTOMER_PRIMARY_KEY]: 'ASC'},
}

API_ENDPOINT_CUSTOMERS = `${process.env.API_URL}/customers`

module.exports = {
  CUSTOMER_PRIMARY_KEY,
  CUSTOMER_KEY_MAP,
  CUSTOMER_FILTER_KEYS,
  CUSTOMER_SORT_KEYS,
  CUSTOMER_SORT_VALUES,
  CUSTOMER_QUERY_PARAM_CONFIG,
  CUSTOMER_BASE_PARAMS,
  API_ENDPOINT_CUSTOMERS,
}
