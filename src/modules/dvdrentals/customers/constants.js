const R = require('ramda')

const RESPONSE_MAP = {
  customer_id: 'id',
  address_id: 'address',
  activebool: 'active',
  email: 'email',
  first_name: 'firstName',
  last_name: 'lastName',
  create_date: 'created',
}

const ORDER_VALUES = ['customer_id', 'email', 'first_name', 'last_name']
const MAPPED_ORDER_VALUES = R.map(R.prop(R.__, RESPONSE_MAP), ORDER_VALUES)
const SORT_VALUES = ['ASC', 'DESC']

// TODO: convert to array so we can retain order eg. [ { key: 'sortField', path: ['sort ...
const QUERY_PARAM_CONFIG = {
  sortField: { path: ['sort', 'field' ], type: 'enum', options: MAPPED_ORDER_VALUES, defaultValue: 'id' },
  sortDirection: { path: ['sort', 'direction' ], type: 'enum', options: SORT_VALUES, defaultValue: 'ASC' },
  pageNumber: { path: ['page', 'number' ], type: 'int', defaultValue: 1 },
  pageSize: { path: ['page', 'size' ], type: 'int', defaultValue: 10 },
}

API_ENDPOINT_CUSTOMERS = `${process.env.API_URL}/customers`

module.exports = {
  RESPONSE_MAP,
  ORDER_VALUES,
  SORT_VALUES,
  QUERY_PARAM_CONFIG,
  API_ENDPOINT_CUSTOMERS,
}
