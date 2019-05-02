const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const parametrize = require('js-parametrize')

const SUT = require('./request.utils')

chai.use(chaiAsPromised)

const { assert } = chai

describe('request.utils', () => {
  describe('pathToUrlQueryParam', () => {
    parametrize([
      [['a', 'b', 'c'], 'a[b][c]'],
      [['a', 'b'], 'a[b]'],
      [['a'], 'a'],
    ], (path, expected) => {
      it('should return url query param for provided path', () => {
        assert.equal(SUT.pathToUrlQueryParam(path), expected)
      })
    })
  })

  describe('extractQueryParams', () => {
    parametrize([
      [{ order: 'created' }, { itemOrder: { path: ['order'], type: 'enum', options: ['created', 'id'], defaultValue: 'id' }}, { itemOrder: 'created' }],
      [{ direction: 'DESC' }, { listDirection: { path: ['direction'], type: 'enum', options: ['ASC', 'DESC'], defaultValue: 'ASC' }}, { listDirection: 'DESC' }],
      [{ limit: '13' }, { limit: { path: ['limit'], type: 'int', defaultValue: 10 }}, { limit: 13 }],
      [{ limit: 13 }, { rowLimit: { path: ['limit'], type: 'int', defaultValue: 10 }}, { rowLimit: 13 }],
      [{ field: 'id' }, { onlyField: { path: ['field'], type: 'string', defaultValue: '' }}, { onlyField: 'id' }],
      [{ sort: { field: 'created' } }, { sortField: { path: ['sort', 'field'], type: 'enum', options: ['created', 'id'], defaultValue: 'id' }}, { sortField: 'created' }],
      [{ page: { limit: 13 } }, { limit: { path: ['page', 'limit'], type: 'int', defaultValue: 10 }}, { limit: 13 }],
      [{ include: { field: 'id' } }, { onlyField: { path: ['include', 'field'], type: 'string', defaultValue: '' }}, { onlyField: 'id' }],
    ], (source, config, expected) => {
      it('should pick from provided object as expected using config', () => {
        assert.deepEqual(SUT.extractQueryParams(config)(source), expected)
      })
    })

    parametrize([
      [{ notOrder: 'AAA' }, { order: { path: ['order'], type: 'enum', options: ['created', 'id'], defaultValue: 'id' }}, { order: 'id' }],
      [{ notDirection: 'AAA' }, { direction: { path: ['direction'], type: 'enum', options: ['ASC', 'DESC'], defaultValue: 'ASC' }}, { direction: 'ASC' }],
      [{ notLimit: 13 }, { limit: { path: ['limit'], type: 'int', defaultValue: 10 }}, { limit: 10 }],
      [{ notField: 'AAA' }, { field: { path: ['field'], type: 'string', defaultValue: 'xxx' }}, { field: 'xxx' }],
    ], (source, config, expected) => {
      it('should use expected defaults from config when fields are unavailable', () => {
        assert.deepEqual(SUT.extractQueryParams(config)(source), expected)
      })
    })

    parametrize([
      [{ order: 'created' }, { order: { path: ['order'], type: 'enum', options: ['id'], defaultValue: 'id' }}, 'invalid value created for order'],
      [{ direction: 'DOWN' }, { direction: { path: ['direction'], type: 'enum', options: ['ASC', 'DESC'], defaultValue: 'ASC' }}, 'invalid value DOWN for direction'],
      [{ limit: 'AAA' }, { limit: { path: ['limit'], type: 'int', defaultValue: 10 }}, 'invalid value AAA for limit'],
      [{ limit: -1 }, { limit: { path: ['limit'], type: 'int', defaultValue: 10 }}, 'invalid value -1 for limit'],
    ], (source, config, expectedErrorMessage) => {
      it('should throw as expected if provided unsupported fields', () => {
        assert.throws(() => SUT.extractQueryParams(config)(source), Error, expectedErrorMessage)
      })
    })
  })
})
