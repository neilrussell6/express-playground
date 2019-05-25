const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
const parametrize = require('js-parametrize')
const R = require('ramda')

const SUT = require('./factory.utils')

chai.use(chaiAsPromised)

const { assert } = chai

describe('common/factory/factory.utils', () => {
  let sandbox = null

  beforeEach(async () => {
    sandbox = await sinon.createSandbox()
  })

  afterEach(async () => {
    await sandbox.restore()
  })

  describe('Factory', () => {
    describe('create', () => {
      parametrize([
        [{ a: 'A' }, { a: 'A' }],
      ], (defaultData, expectedCall) => {
        it('should create a single new record with default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub().resolves({ dataValues: 'MODEL CREATE RESULT' })
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to create a new record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.create()

          // then ... should correctly create and return new record as expected
          sinon.assert.calledWithExactly(modelCreateStub, expectedCall)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, 'MODEL CREATE RESULT')
        })
      })

      parametrize([
        [{ a: 'A' }, { b: 'B' }, { a: 'A', b: 'B' }],
      ], (defaultData, additionalData, expectedCall) => {
        it('should create a single new record merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub().resolves({ dataValues: 'MODEL CREATE RESULT' })
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to create a new record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.create(additionalData)

          // then ... should correctly create and return new record as expected
          sinon.assert.calledWithExactly(modelCreateStub, expectedCall)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, 'MODEL CREATE RESULT')
        })
      })

      parametrize([
        [{ a: 'A' }, 1, { b: 'B' }, { a: 'A', b: 'B' }],
      ], (defaultData, count, additionalData, expectedCall) => {
        it('should create a single new record for count of one, merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub().resolves({ dataValues: 'MODEL CREATE RESULT' })
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to create a new record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.create(count, additionalData)

          // then ... should correctly create and return new record as expected
          sinon.assert.calledWithExactly(modelCreateStub, expectedCall)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, 'MODEL CREATE RESULT')
        })
      })

      parametrize([
        [{ a: 'A' }, 2, { b: 'B' }, R.repeat({ a: 'A', b: 'B' }, 2)],
        [{ a: 'A' }, 3, { b: 'B' }, R.repeat({ a: 'A', b: 'B' }, 3)],
      ], (defaultData, count, additionalData, expectedCall) => {
        it('should create multiple new records for count, merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub()
          const modelBulkCreateStub = sandbox.stub().resolves([{ dataValues: 'MODEL BULK CREATE RESULT' }])
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to create multiple new records
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.create(count, additionalData)

          // then ... should correctly create and return new records as expected
          sinon.assert.calledWithExactly(modelBulkCreateStub, expectedCall, { returning: true })
          sinon.assert.notCalled(modelCreateStub)
          assert.deepEqual(result, 'MODEL BULK CREATE RESULT')
        })
      })

      // TODO: test factoryCreateAssociated path
    })

    describe('build', () => {
      parametrize([
        [{ a: 'A' }, { a: 'A' }],
      ], (defaultData, expected) => {
        it('should build a single record with default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub()
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to build a record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.build()

          // then ... should correctly build and return record as expected
          sinon.assert.notCalled(modelCreateStub)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, expected)
        })
      })

      parametrize([
        [{ a: 'A' }, { b: 'B' }, { a: 'A', b: 'B' }],
      ], (defaultData, additionalData, expected) => {
        it('should build a single record merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub()
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to build a record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.build(additionalData)

          // then ... should correctly build and return record as expected
          sinon.assert.notCalled(modelCreateStub)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, expected)
        })
      })

      parametrize([
        [{ a: 'A' }, 1, { b: 'B' }, { a: 'A', b: 'B' }],
      ], (defaultData, count, additionalData, expected) => {
        it('should build a single record for count of one, merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub()
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to build a record
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.build(count, additionalData)

          // then ... should correctly build and return record as expected
          sinon.assert.notCalled(modelCreateStub)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, expected)
        })
      })

      parametrize([
        [{ a: 'A' }, 2, { b: 'B' }, R.repeat({ a: 'A', b: 'B' }, 2)],
        [{ a: 'A' }, 3, { b: 'B' }, R.repeat({ a: 'A', b: 'B' }, 3)],
      ], (defaultData, count, additionalData, expected) => {
        it('should build multiple records for count, merging provided data into default data', async () => {
          // given ... the provided model will behave as expected
          const modelCreateStub = sandbox.stub()
          const modelBulkCreateStub = sandbox.stub()
          const modelStub = {
            create: modelCreateStub,
            bulkCreate: modelBulkCreateStub,
          }

          // when
          // ... we configure a factory for the provided model
          // ... with the provided default data
          // ... and use it to build multiple records
          const modelFactory = SUT.Factory(modelStub, defaultData)
          const result = await modelFactory.build(count, additionalData)

          // then ... should correctly build and return records as expected
          sinon.assert.notCalled(modelCreateStub)
          sinon.assert.notCalled(modelBulkCreateStub)
          assert.deepEqual(result, expected)
        })
      })

      // TODO: test buildAssociated path
    })
  })
})
