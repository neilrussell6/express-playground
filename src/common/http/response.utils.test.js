const { assert } = require('chai')
const parametrize = require('js-parametrize')

const SUT = require('./response.utils')

describe('response.utils', () => {
  describe('transformResponse', () => {
    parametrize([
      [{ a: 'A' }, { a: 'b' }, { b: 'A' }],
      [{ a: 'A', c: 'C' }, { a: 'b' }, { b: 'A' }],
      [{ a: 'A', c: 'C' }, { a: 'b', c: 'c' }, { b: 'A', c: 'C' }],
    ], (source, fieldMap, expected) => {
      it('should transform provided object keys as expected using map object', () => {
        assert.deepEqual(SUT.transformResponse(fieldMap)(source), expected)
      })
    })
  })

  describe('rebuildExtraQueryParams', () => {
    parametrize([
      [
        // then ... should include all with values that match config
        {
          page: { size: '15', number: '3' },
          sort: { direction: 'DESC', field: 'email' },
        },
        {
          sortField: { path: [ 'sort', 'field' ] },
          sortDirection: { path: [ 'sort', 'direction' ] },
          pageNumber: { path: [ 'page', 'number' ] },
          pageSize: { path: [ 'page', 'size' ] },
        },
        '&sort[field]=email&sort[direction]=DESC&page[size]=15',
      ],
      // then ... should exclude missing
      [
        {
          page: { number: '3' },
          sort: { direction: 'DESC' },
        },
        {
          sortField: { path: [ 'sort', 'field' ] },
          sortDirection: { path: [ 'sort', 'direction' ] },
          pageNumber: { path: [ 'page', 'number' ] },
          pageSize: { path: [ 'page', 'size' ] },
        },
        '&sort[direction]=DESC',
      ],
      // then ... should exclude nulls
      [
        {
          page: { size: null, number: '3' },
          sort: { direction: null, field: 'email' },
        },
        {
          sortField: { path: [ 'sort', 'field' ] },
          sortDirection: { path: [ 'sort', 'direction' ] },
          pageNumber: { path: [ 'page', 'number' ] },
          pageSize: { path: [ 'page', 'size' ] },
        },
        '&sort[field]=email',
      ],
      // then ... should exclude those not in config
      [
        {
          page: { size: '15', number: '3' },
          sort: { direction: 'DESC', field: 'email' },
        },
        {
          sortDirection: { path: [ 'sort', 'direction' ] },
          pageNumber: { path: [ 'page', 'number' ] },
        },
        '&sort[direction]=DESC',
      ],
      // then ... should return empty string for no matches
      [
        {
          page: { aaa: '15', bbb: '3' },
          sort: { ccc: 'DESC', ddd: 'email' },
        },
        {
          sortDirection: { path: [ 'sort', 'direction' ] },
          pageSize: { path: [ 'page', 'size' ] },
        },
        '',
      ],
    ], (queryParams, queryParamsConfig, expected) => {
      it('should build extra (excluding page[number]) query params as expected', () => {
        assert.equal(SUT.rebuildExtraQueryParams(queryParams)(queryParamsConfig), expected)
      })
    })
  })

  describe('buildPaginationResponse', () => {
    it('should build pagination response as expected for no query params', () => {
      const endpoint = 'api'
      const queryParams = {}
      const queryParamsConfig = {}
      const pageNumber = 3
      const pageSize = 10
      const count = 50
      const rows = []
      assert.deepEqual(SUT.buildPaginationResponse(endpoint, queryParams, queryParamsConfig, pageNumber, pageSize, rows, count), {
        meta: {
          firstRow: 21,
          totalRows: 50,
          currentPage: 3,
          totalPages: 5,
        },
        links: {
          self: 'api?page=3',
          prev: 'api?page=2',
          next: 'api?page=4',
          first:'api?page=1',
          last: 'api?page=5',
        },
        data: rows,
      })
    })

    it('should build pagination response as expected for multiple query params', () => {
      const endpoint = 'api'
      const queryParams = {
        page: { size: '15', number: '3' },
        sort: { direction: 'DESC', field: 'email' },
      }
      const queryParamsConfig = {
        sortField: { path: [ 'sort', 'field' ] },
        sortDirection: { path: [ 'sort', 'direction' ] },
        pageNumber: { path: [ 'page', 'number' ] },
        pageSize: { path: [ 'page', 'size' ] },
      }
      const pageNumber = 3
      const pageSize = 10
      const count = 50
      const rows = []
      assert.deepEqual(SUT.buildPaginationResponse(endpoint, queryParams, queryParamsConfig, pageNumber, pageSize, rows, count), {
        meta: {
          firstRow: 21,
          totalRows: 50,
          currentPage: 3,
          totalPages: 5,
        },
        links: {
          self: 'api?page=3&sort[field]=email&sort[direction]=DESC&page[size]=15',
          prev: 'api?page=2&sort[field]=email&sort[direction]=DESC&page[size]=15',
          next: 'api?page=4&sort[field]=email&sort[direction]=DESC&page[size]=15',
          first:'api?page=1&sort[field]=email&sort[direction]=DESC&page[size]=15',
          last: 'api?page=5&sort[field]=email&sort[direction]=DESC&page[size]=15',
        },
        data: rows,
      })
    })
  })
})
