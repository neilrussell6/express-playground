const { assert } = require('chai')
const parametrize = require('js-parametrize')

const SUT = require('./response.utils')
const { queryParamTypes } = require('../../common/http/request.utils')

const {
  ENUM_KEYS_VALUES,
  ENUM_KEYS,
  INT,
} = queryParamTypes

describe('common/http/response.utils', () => {
  describe('transformResponse', () => {
    parametrize([
      [{ a: 'A' }, { a: 'aa' }, { aa: 'A' }],
      [{ a: 'A', c: 'C' }, { a: 'bbb' }, { bbb: 'A' }],
      [{ a: 'A', c: 'C' }, { a: 'bB', c: 'cC' }, { bB: 'A', cC: 'C' }],
      [{ a: 'A' }, { a: 'bB', c: 'cC' }, { bB: 'A', cC: null }],
    ], (source, fieldMap, expected) => {
      it('should transform provided object keys as expected using map object', () => {
        assert.deepEqual(SUT.transformResponse(fieldMap)(source), expected)
      })
    })
  })

  describe('rebuildExtraQueryParams', () => {
    parametrize([
      [[
        { key: 'sorting', path: ['sort'], type: ENUM_KEYS_VALUES, keys: ['email', 'name'], values: ['ASC', 'DESC'] },
        { key: 'filtering', path: ['filter'], type: ENUM_KEYS, keys: ['email', 'phone'], values: ['ASC', 'DESC'] },
        { key: 'pageNumber', path: ['page', 'number'], type: INT },
        { key: 'pageSize', path: ['page', 'size'], type: INT },
        { key: 'active', path: ['active'], type: INT },
      ]],
    ], [
      [
        // then ... should include all with values that match config
        {
          active: true,
          page: { number: '3', size: '15' },
          sort: { email: 'DESC', name: 'ASC' },
          filter: { email: 'aaa@', phone: '01' },
        },
        'sort[email]=DESC&sort[name]=ASC&filter[email]=aaa@&filter[phone]=01&page[number]=3&page[size]=15&active=true',
      ],
      [
        // then ... should exclude missing
        {
          page: { number: '3' },
          sort: { email: 'DESC' },
          filter: { email: 'aaa@' },
        },
        'sort[email]=DESC&filter[email]=aaa@&page[number]=3',
      ],
      // then ... should exclude nulls
      [
        {
          active: null,
          page: { size: null, number: '3' },
          sort: { email: 'DESC', name: null },
          filter: { email: null, phone: '01' },
        },
        'sort[email]=DESC&filter[phone]=01&page[number]=3',
      ],
      // then ... should exclude those not in config
      [
        {
          notActive: true,
          page: { bbb: '2', number: '3' },
          ccc: { number: '5' },
          sort: { email: 'DESC', ccc: 'ASC' },
          filter: { email: 'aaa@', ddd: '01' },
        },
        'sort[email]=DESC&filter[email]=aaa@&page[number]=3',
      ],
      // then ... should return empty string for no matches
      [
        {
          notActive: true,
          page: { bbb: '2' },
          ccc: { number: '5' },
          sort: { ccc: 'ASC' },
          filter: { ddd: '01' },
        },
        '',
      ],
    ], (queryParamsConfig, queryParams, expected) => {
      it('should build extra (excluding page[number]) query params as expected', () => {
        assert.equal(SUT.rebuildExtraQueryParams(queryParams)(queryParamsConfig), expected)
      })
    })
  })

  describe('buildPaginationResponse', () => {
    it('should build pagination response as expected for no query params', () => {
      const endpoint = 'api'
      const baseParams = {
        pageNumber: 3,
        pageSize: 10,
        sorting: { id: 'ASC' },
      }
      const queryParams = {}
      const queryParamsConfig = [
        { key: 'pageNumber', path: ['page', 'number'], type: INT },
        { key: 'pageSize', path: ['page', 'size'], type: INT },
      ]
      const count = 50
      const rows = []
      assert.deepEqual(SUT.buildPaginationResponse(endpoint, baseParams, queryParams, queryParamsConfig, rows, count), {
        meta: {
          firstRow: 21,
          totalRows: 50,
          currentPage: 3,
          totalPages: 5,
          pageSize: 10,
        },
        links: {
          self: 'api?page[number]=3',
          prev: 'api?page[number]=2',
          next: 'api?page[number]=4',
          first: 'api?page[number]=1',
          last: 'api?page[number]=5',
        },
        data: rows,
      })
    })

    it('should build pagination response as expected for multiple query params', () => {
      const endpoint = 'api'
      const baseParams = {
        pageNumber: 3,
        pageSize: 10,
        sorting: { id: 'ASC' },
      }
      const queryParams = {
        page: { size: '15', number: '3' },
        sort: { phone: 'up', email: 'down' },
        filter: { phone: '07', email: 'aa@' },
      }
      const queryParamsConfig = [
        { key: 'sorting', path: ['sort'], type: ENUM_KEYS_VALUES, keys: ['phone', 'email'], values: ['up', 'down'] },
        { key: 'filtering', path: ['filter'], type: ENUM_KEYS, keys: ['phone', 'email'] },
        { key: 'pageNumber', path: ['page', 'number'], type: INT },
        { key: 'pageSize', path: ['page', 'size'], type: INT },
      ]
      const count = 50
      const rows = []
      assert.deepEqual(SUT.buildPaginationResponse(endpoint, baseParams, queryParams, queryParamsConfig, rows, count), {
        meta: {
          firstRow: 21,
          totalRows: 50,
          currentPage: 3,
          totalPages: 5,
          pageSize: 10,
        },
        links: {
          self: 'api?page[number]=3&sort[phone]=up&sort[email]=down&filter[phone]=07&filter[email]=aa@&page[size]=15',
          prev: 'api?page[number]=2&sort[phone]=up&sort[email]=down&filter[phone]=07&filter[email]=aa@&page[size]=15',
          next: 'api?page[number]=4&sort[phone]=up&sort[email]=down&filter[phone]=07&filter[email]=aa@&page[size]=15',
          first: 'api?page[number]=1&sort[phone]=up&sort[email]=down&filter[phone]=07&filter[email]=aa@&page[size]=15',
          last: 'api?page[number]=5&sort[phone]=up&sort[email]=down&filter[phone]=07&filter[email]=aa@&page[size]=15',
        },
        data: rows,
      })
    })
  })
})
