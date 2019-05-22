const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const parametrize = require('js-parametrize')

const SUT = require('./request.utils')
const { queryParamTypes } = require('./request.utils')

chai.use(chaiAsPromised)

const { assert } = chai
const {
  ENUM_KEYS_VALUES,
  ENUM_KEYS,
  INT,
} = queryParamTypes

describe('common/http/request.utils', () => {
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

    // <path>[<SORT_KEYS>]=<SORT_VALUES>
    // eg.
    // if key is 'sorting'
    // and path is ['sort', 'by', 'some']
    // then:
    // sort[by][some][firstName]=DESC
    // will become:
    // { sorting: { firstName: 'DESC' }

    describe('enum-keys-values', () => {
      parametrize([
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'A' } }, [['a', 'A']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'B' } }, [['a', 'B']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { b: 'A' } }, [['b', 'A']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { b: 'B' } }, [['b', 'B']]],
        [{ a: 'aa', A: 'AA' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'A' } }, [['aa', 'AA']]],
        [{ a: 'aa', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'B' } }, [['aa', 'BB']]],
        [{ b: 'bb', A: 'AA' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { b: 'A' } }, [['bb', 'AA']]],
        [{ b: 'bb', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { b: 'B' } }, [['bb', 'BB']]],
      ], (keyMap, path, validKeys, validValues, data, expected) => {
        it('should extract enum-keys-values type using provided config as expected', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues },
            { key: 'key2', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'C' } }],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { c: 'B' } }],
        [{ a: 'aa', C: 'CC' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { a: 'C' } }],
        [{ c: 'cc', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { sort: { c: 'B' } }],
      ], (keyMap, path, validKeys, validValues, data) => {
        it('should exclude enum-keys-values type that do not match config keys or values', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues },
            { key: 'key2', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: [], key2: [] })
        })
      })

      parametrize([
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'C' }, [['a', 'C']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { c: 'B' }, [['c', 'B']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { c: 'C' }, [['c', 'C']]],
        [{ a: 'aa', C: 'CC' }, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'C' }, [['aa', 'CC']]],
        [{ c: 'cc', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { c: 'B' }, [['cc', 'BB']]],
        [{ c: 'cc', C: 'CC' }, ['sort'], ['a', 'b'], ['A', 'B'], { c: 'C' }, [['cc', 'CC']]],
      ], (keyMap, path, validKeys, validValues, baseValue, expected) => {
        it('should include base value for enum-keys-values type when provided regardless of whether it is valid', () => {
          const data = {}
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
            { key: 'key2', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'A' }, { sort: { a: 'A' } }, [['a', 'A']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { b: 'B' }, { sort: { b: 'B' } }, [['b', 'B']]],
        [{ a: 'aa', A: 'AA' }, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'A' }, { sort: { a: 'A' } }, [['aa', 'AA']]],
        [{ b: 'bb', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { b: 'B' }, { sort: { b: 'B' } }, [['bb', 'BB']]],
      ], (keyMap, path, validKeys, validValues, baseValue, data, expected) => {
        it('should include but not duplicate base value for enum-keys-values type when also found in data', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
            { key: 'key2', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'B' }, { sort: { a: 'A' } }, [['a', 'A']]],
        [null, ['sort'], ['a', 'b'], ['A', 'B'], { b: 'A' }, { sort: { b: 'B' } }, [['b', 'B']]],
        [{ a: 'aa', A: 'AA' }, ['sort'], ['a', 'b'], ['A', 'B'], { a: 'B' }, { sort: { a: 'A' } }, [['aa', 'AA']]],
        [{ b: 'bb', B: 'BB' }, ['sort'], ['a', 'b'], ['A', 'B'], { b: 'A' }, { sort: { b: 'B' } }, [['bb', 'BB']]],
      ], (keyMap, path, validKeys, validValues, baseValue, data, expected) => {
        it('should prefer data over base value for enum-keys-values type when duplicate', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
            { key: 'key2', path, type: ENUM_KEYS_VALUES, keys: validKeys, values: validValues, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      // TODO: test keys & values missing from keyMap
    })

    describe('enum-keys', () => {

      // <path>[<FILTER_KEYS>]=<any value>
      // eg.
      // if key is 'filtering'
      // and path is ['filter', 'by', 'some']
      // then:
      // filter[by][some][firstName]=anna
      // will become:
      // { filtering: { firstName: 'anna' } }

      parametrize([
        [null, ['filter'], ['a', 'b'], { filter: { b: 'ANY' } }, [['b', 'ANY']]],
        [null, ['filter'], ['a', 'b'], { filter: { a: 'THING' } }, [['a', 'THING']]],
        [{ b: 'bb' }, ['filter'], ['a', 'b'], { filter: { b: 'ANY' } }, [['bb', 'ANY']]],
        [{ a: 'aa' }, ['filter'], ['a', 'b'], { filter: { a: 'THING' } }, [['aa', 'THING']]],
      ], (keyMap, path, validKeys, data, expected) => {
        it('should extract enum-keys type using provided config as expected', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS, keys: validKeys },
            { key: 'key2', path, type: ENUM_KEYS, keys: validKeys },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['filter'], ['a', 'b'], { filter: { c: 'ANY' } }],
        [null, ['filter'], ['a', 'b'], { filter: { c: 'THING' } }],
        [{ c: 'cc' }, ['filter'], ['a', 'b'], { filter: { c: 'ANY' } }],
        [{ c: 'cc' }, ['filter'], ['a', 'b'], { filter: { c: 'THING' } }],
      ], (keyMap, path, validKeys, data) => {
        it('should exclude enum-keys type that do not match config keys', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS, keys: validKeys },
            { key: 'key2', path, type: ENUM_KEYS, keys: validKeys },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: [], key2: [] })
        })
      })

      parametrize([
        [null, ['filter'], ['a', 'b'], { c: 'ANY' }, [['c', 'ANY']]],
        [null, ['filter'], ['a', 'b'], { d: 'THING' }, [['d', 'THING']]],
        [{ c: 'cc' }, ['filter'], ['a', 'b'], { c: 'ANY' }, [['cc', 'ANY']]],
        [{ d: 'dd' }, ['filter'], ['a', 'b'], { d: 'THING' }, [['dd', 'THING']]],
      ], (keyMap, path, validKeys, baseValue, expected) => {
        it('should include base value for enum-keys type when provided regardless of whether it is valid', () => {
          const data = {}
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS, keys: validKeys, baseValue },
            { key: 'key2', path, type: ENUM_KEYS, keys: validKeys, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['filter'], ['a', 'b'], { a: 'A' }, { filter: { a: 'A' } }, [['a', 'A']]],
        [null, ['filter'], ['a', 'b'], { b: 'B' }, { filter: { b: 'B' } }, [['b', 'B']]],
        [{ a: 'aa' }, ['filter'], ['a', 'b'], { a: 'A' }, { filter: { a: 'A' } }, [['aa', 'A']]],
        [{ b: 'bb' }, ['filter'], ['a', 'b'], { b: 'B' }, { filter: { b: 'B' } }, [['bb', 'B']]],
      ], (keyMap, path, validKeys, baseValue, data, expected) => {
        it('should include but not duplicate base value for enum-keys-values type when also found in data', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS, keys: validKeys, baseValue },
            { key: 'key2', path, type: ENUM_KEYS, keys: validKeys, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [null, ['filter'], ['a', 'b'], { a: 'B' }, { filter: { a: 'A' } }, [['a', 'A']]],
        [null, ['filter'], ['a', 'b'], { b: 'A' }, { filter: { b: 'B' } }, [['b', 'B']]],
        [{ a: 'aa' }, ['filter'], ['a', 'b'], { a: 'B' }, { filter: { a: 'A' } }, [['aa', 'A']]],
        [{ b: 'bb' }, ['filter'], ['a', 'b'], { b: 'A' }, { filter: { b: 'B' } }, [['bb', 'B']]],
      ], (keyMap, path, validKeys, baseValue, data, expected) => {
        it('should prefer data over base value for enum-keys-values type when duplicate', () => {
          const configs = [
            { key: 'key1', path, type: ENUM_KEYS, keys: validKeys, baseValue },
            { key: 'key2', path, type: ENUM_KEYS, keys: validKeys, baseValue },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs, keyMap)(data), { key1: expected, key2: expected })
        })
      })
    })

    describe('int', () => {

      // <path>=<INTEGER>
      // eg.
      // if key is 'pageNumber'
      // and path is ['page', 'number']
      // then:
      // page[number]=123
      // will become:
      // { pageNumber: 123 }

      parametrize([
        [['page', 'number'], { page: { number: 123 } }, 123],
        [['page', 'number'], { page: { number: '456' } }, 456],
      ], (path, data, expected) => {
        it('should extract int type using provided config as expected', () => {
          const configs = [
            { key: 'key1', path, type: INT },
            { key: 'key2', path, type: INT },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs)(data), { key1: expected, key2: expected })
        })
      })

      parametrize([
        [['page', 'number'], { page: { number: 'xxx' } }],
        [['page', 'number'], { page: { number: null } }],
      ], (path, data) => {
        it('should exclude invalid values', () => {
          const configs = [
            { key: 'key1', path, type: INT },
            { key: 'key2', path, type: INT },
          ]
          assert.deepEqual(SUT.extractQueryParams(configs)(data), {})
          // assert.deepEqual(SUT.extractQueryParams(configs)(data), { key1: null, key2: null })
        })
      })
    })
  })

  describe('transformRequestBody', () => {
    parametrize([
      [{ aA: 'a_a', bB: 'b_b' }, { aA: 'A', bB: 'B' }, { a_a: 'A', b_b: 'B' }],
    ], (keyMap, data, expected) => {
      it('should transform request using key map as expected', () => {
        assert.deepEqual(SUT.transformRequestBody(keyMap)(data), expected)
      })
    })

    parametrize([
      [{ aA: 'A', bB: 'B' }],
    ], [
      [{ aA: 'a_a' }, { a_a: 'A' }],
      [{ bB: 'b_b' }, { b_b: 'B' }],
    ], (data, keyMap, expected) => {
      it('should exclude data that not found in key map', () => {
        assert.deepEqual(SUT.transformRequestBody(keyMap)(data), expected)
      })
    })
  })
})
