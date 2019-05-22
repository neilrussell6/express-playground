const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const parametrize = require('js-parametrize')
const R = require('ramda')
const Bluebird = require('bluebird')

const models = require('../../../db/models/index')
const SUT = require('./paginate.utils')
const Factories = require('../../modules/dvdrentals/customers/factories') // TODO: replace with factory created in this test

chai.use(chaiAsPromised)

const { assert } = chai

// TODO: replace all dvdrentals with models/factories created in this test
describe('common/db/paginate.utils', () => {
  beforeEach(async () => {
    await models.sequelize.sync({ force: true, match: /_test$/ })
  })

  describe('paginate', () => {
    describe('count', () => {
      parametrize([
        [5, { pageSize: 2, pageNumber: 1 }],
        [3, { pageSize: 2, pageNumber: 1 }],
        [3, { pageSize: 3, pageNumber: 1 }],
      ], (rowCount, config) => {
        it('should return expected total count', async () => {
          // given ... the provided number of records
          await Factories.Country.create(rowCount)

          // when ... we paginate with the provided config
          const result = await SUT.paginate(models.Country, 'country_id', config)

          // then ... should return expected count
          assert.equal(result.count, rowCount)
        })
      })
    })

    describe('filtered count', () => {
      parametrize([
        [[[1, 'Ab'], [2, 'Ba'], [3, 'Ac'], [4, 'Bb'], [5, 'Aa']]],
      ], [
        [{ filtering: [['country', 'a']], pageSize: 2, pageNumber: 1 }, 3],
        [{ filtering: [['country', 'a']], pageSize: 1, pageNumber: 1 }, 3],
        [{ filtering: [['country', 'b']], pageSize: 1, pageNumber: 1 }, 2],
        [{ filtering: [['country', 'c']], pageSize: 1, pageNumber: 1 }, 0],
      ], (records, config, expectedRowCount) => {
        it('should return expected total count', async () => {
          // given ... provided records
          await Bluebird.map(records, ([country_id, country]) => (
            Factories.Country.create({ country_id, country })
          ))

          // when ... we paginate with the provided config
          const result = await SUT.paginate(models.Country, 'country_id', config)

          // then ... should return expected count
          assert.equal(result.count, expectedRowCount)
        })
      })
    })

    describe('pageSize/pageNumber', () => {
      parametrize([
        [5, { pageSize: 2, pageNumber: 1 }, [1,2]],
        [3, { pageSize: 2, pageNumber: 1 }, [1,2]],
        [2, { pageSize: 2, pageNumber: 1 }, [1,2]],
        [1, { pageSize: 2, pageNumber: 1 }, [1]],
        [5, { pageSize: 3, pageNumber: 1 }, [1,2,3]],
        [5, { pageSize: 2, pageNumber: 2 }, [3,4]],
        [5, { pageSize: 2, pageNumber: 3 }, [5]],
      ], (rowCount, config, expectedRecordIds) => {
        it('should return expected records', async () => {
          // given ... the provided number of records
          await Factories.Country.create(rowCount)

          // when ... we paginate with the provided config
          const result = await SUT.paginate(models.Country, 'country_id', config)

          // then ... should return expected records
          const recordIds = R.pluck('country_id', result.rows)
          assert.deepEqual(recordIds, expectedRecordIds)
        })
      })

      // TODO: test invalid page numbers
    })

    describe('filtering : single', () => {
      parametrize([
        [[[1, 'Ab'], [2, 'Ba'], [3, 'Ca'], [4, 'Bb'], [5, 'Aa']]],
      ], [
        [{ filtering: [['country', 'b']] }, [2, 4]],
        [{ filtering: [['country', 'bb']] }, [4]],
        [{ filtering: [['country', 'bbb']] }, []],
        [{ filtering: [['country', 'a']] }, [1, 5]],
        [{ filtering: [['country', 'c']] }, [3]],
      ], (records, config, expectedRecordIds) => {
        it('should filter and return expected rows', async () => {
          // given ... provided records
          await Bluebird.map(records, ([country_id, country]) => (
            Factories.Country.create({ country_id, country }))
          )

          // when ... we paginate with the provided config
          const _config = R.mergeRight(config, { pageSize: records.length, pageNumber: 1 })
          const result = await SUT.paginate(models.Country, 'country_id', _config)

          // then ... should return expected records
          const recordIds = R.pluck('country_id', result.rows)
          assert.sameMembers(recordIds, expectedRecordIds)
        })
      })

      parametrize([
        [[[1, 'Ab'], [2, 'Ba'], [3, 'Ca'], [4, 'Bb'], [5, 'Aa'], [6, 'Aaa'], [7, 'Aba']]],
      ], [
        [{ filtering: [['country', 'a']], pageSize: 3, pageNumber: 1 }, [1, 5, 6]],
        [{ filtering: [['country', 'a']], pageSize: 5, pageNumber: 1 }, [1, 5, 6, 7]],
        [{ filtering: [['country', 'a']], pageSize: 3, pageNumber: 2 }, [7]],
        [{ filtering: [['country', 'b']], pageSize: 3, pageNumber: 1 }, [2, 4]],
        [{ filtering: [['country', 'b']], pageSize: 1, pageNumber: 1 }, [2]],
        [{ filtering: [['country', 'b']], pageSize: 1, pageNumber: 2 }, [4]],
      ], (records, config, expectedRecordIds) => {
        it('should filter and paginate correctly returning expected rows', async () => {
          // given ... provided records
          await Bluebird.map(records, ([country_id, country]) => (
            Factories.Country.create({ country_id, country }))
          )

          // when ... we paginate with the provided config
          const result = await SUT.paginate(models.Country, 'country_id', config)

          // then ... should return expected records
          const recordIds = R.pluck('country_id', result.rows)
          assert.sameMembers(recordIds, expectedRecordIds)
        })
      })
    })

    describe('filtering : multiple', () => {
      parametrize([
        [[
          [1, 'Aa', 'Aa'],
          [2, 'Ab', 'Aa'],
          [3, 'Aa', 'Ab'],
          [4, 'Ab', 'Ab'],
          [5, 'Aa', 'Ba'],
        ]],
      ], [
        [{ filtering: [['address', 'a'], ['address2', 'a']] }, [1, 2, 3, 4]],
        [{ filtering: [['address', 'aa'], ['address2', 'a']] }, [1, 3]],
        [{ filtering: [['address', 'aa'], ['address2', 'aa']] }, [1]],
        [{ filtering: [['address', 'a'], ['address2', 'b']] }, [5]],
        [{ filtering: [['address', 'ab'], ['address2', 'b']] }, []],
        [{ filtering: [['address', 'a'], ['address2', 'ab']] }, [3, 4]],
      ], (records, config, expectedRecordIds) => {
        it('should filter and return expected rows', async () => {
          // given ... provided records
          await Bluebird.map(records, ([address_id, address, address2]) => (
            Factories.Address.create({ address_id, address, address2 })
          ))

          // when ... we paginate with the provided config
          const _config = R.mergeRight(config, { pageSize: records.length, pageNumber: 1 })
          const result = await SUT.paginate(models.Address, 'address_id', _config)

          // then ... should return expected records
          const recordIds = R.pluck('address_id', result.rows)
          assert.sameMembers(recordIds, expectedRecordIds)
        })
      })

      parametrize([
        [[
          [1, 'Aa', 'Aa'],
          [2, 'Ab', 'Aa'],
          [3, 'Aa', 'Ab'],
          [4, 'Ab', 'Ab'],
          [5, 'Aa', 'Ba'],
          [6, 'Aaa', 'Aa'],
          [7, 'Aba', 'Aa'],
        ]],
      ], [
        [{ filtering: [['address', 'a'], ['address2', 'a']], pageSize: 6, pageNumber: 1 }, [1, 2, 3, 4, 6, 7]],
        [{ filtering: [['address', 'a'], ['address2', 'a']], pageSize: 3, pageNumber: 1 }, [1, 2, 3]],
        [{ filtering: [['address', 'a'], ['address2', 'a']], pageSize: 3, pageNumber: 2 }, [4, 6, 7]],
        [{ filtering: [['address', 'ab'], ['address2', 'a']], pageSize: 6, pageNumber: 1 }, [2, 4, 7]],
        [{ filtering: [['address', 'ab'], ['address2', 'a']], pageSize: 2, pageNumber: 1 }, [2, 4]],
        [{ filtering: [['address', 'ab'], ['address2', 'a']], pageSize: 2, pageNumber: 2 }, [7]],
      ], (records, config, expectedRecordIds) => {
        it('should filter and return expected rows', async () => {
          // given ... provided records
          await Bluebird.map(records, ([address_id, address, address2]) => (
            Factories.Address.create({ address_id, address, address2 })
          ))

          // when ... we paginate with the provided config
          const result = await SUT.paginate(models.Address, 'address_id', config)

          // then ... should return expected records
          const recordIds = R.pluck('address_id', result.rows)
          assert.sameMembers(recordIds, expectedRecordIds)
        })
      })
    })
  })

  describe('sorting : single', () => {
    parametrize([
      [[[1, 'Ab'], [2, 'Ba'], [3, 'Ca'], [4, 'Bb'], [5, 'Aa'], [6, 'Ba']]],
    ], [
      [{ sorting: [['country', 'ASC']] }, [5, 1, 2, 6, 4, 3]],
      [{ sorting: [['country', 'DESC']] }, [3, 4, 2, 6, 1, 5]],
    ], (records, config, expectedRecordIds) => {
      it('should sort correctly returning all rows ordered as expected', async () => {
        // given ... provided records
        await Bluebird.map(records, ([country_id, country]) => (
          Factories.Country.create({ country_id, country }))
        )

        // when ... we paginate with the provided config
        const _config = R.mergeRight(config, { pageSize: records.length, pageNumber: 1 })
        const result = await SUT.paginate(models.Country, 'country_id', _config)

        // then ... should return expected records
        const recordIds = R.pluck('country_id', result.rows)
        assert.sameOrderedMembers(recordIds, expectedRecordIds)
      })
    })
  })

  describe('sorting : multiple', () => {
    parametrize([
      [[
        [1, 'Aa', 'Aa'],
        [2, 'Aa', 'Ab'],
        [3, 'Aa', 'Ac'],
        [4, 'Ab', 'Ac'],
        [5, 'Ab', 'Ab'],
        [6, 'Ab', 'Ab'],
        [7, 'Ab', 'Aa'],
        [8, 'Ba', 'Aa'],
      ]],
    ], [
      [{ sorting: [['address', 'ASC'], ['address2', 'ASC']] }, [1, 2, 3, 7, 5, 6, 4, 8]],
      [{ sorting: [['address', 'ASC'], ['address2', 'DESC']] }, [3, 2, 1, 4, 5, 6, 7, 8]],
      [{ sorting: [['address', 'DESC'], ['address2', 'ASC']] }, [8, 7, 5, 6, 4, 1, 2, 3]],
      [{ sorting: [['address', 'DESC'], ['address2', 'DESC']] }, [8, 4, 5, 6, 7, 3, 2, 1]],
    ], (records, config, expectedRecordIds) => {
      it('should sort correctly returning all rows ordered as expected', async () => {
        // given ... provided records
        await Bluebird.map(records, ([address_id, address, address2]) => (
          Factories.Address.create({ address_id, address, address2 }))
        )

        // when ... we paginate with the provided config
        const _config = R.mergeRight(config, { pageSize: records.length, pageNumber: 1 })
        const result = await SUT.paginate(models.Address, 'address_id', _config)

        // then ... should return expected records
        const recordIds = R.pluck('address_id', result.rows)
        assert.sameOrderedMembers(recordIds, expectedRecordIds)
      })
    })
  })
})
