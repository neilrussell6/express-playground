const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
const R = require('ramda')

const { CUSTOMER_KEY_MAP } = require('./constants')
const SUT = require('./handlers')
const DbUtils = require('./db.utils')
const Factories = require('./factories')

chai.use(chaiAsPromised)

const { assert } = chai

// --------------------------
// fixtures
// --------------------------

describe('dvdrentals/customers/handlers', () => {
  let sandbox = null

  beforeEach(async () => {
    sandbox = await sinon.createSandbox()
  })

  afterEach(async () => {
    await sandbox.restore()
  })

  describe('getCustomers', () => {
    it('should returns expected response for no customers', async () => {
      // given ... getting customers from DB will succeed
      const getCustomersStub = sandbox
        .stub(DbUtils, 'getCustomers')
        .returns(sandbox.stub().resolves({ count: 0, rows: [] }))

      // when ... we get customers
      const query = { filter: { firstName: 'an', lastName: 'b' }, sort: { firstName: 'ASC' } }
      const result = await SUT.getCustomers(query)

      // then
      // ... should succeed returning expected response
      assert.deepEqual(result.meta, {
        currentPage: 1,
        firstRow: 1,
        pageSize: 10,
        totalPages: 0,
        totalRows: 0,
      })
      assert.deepEqual(result.links, {
        first: 'http://localhost:3001/customers?page[number]=1',
        last: 'http://localhost:3001/customers?page[number]=0',
        next: 'http://localhost:3001/customers?page[number]=1',
        prev: 'http://localhost:3001/customers?page[number]=1',
        self: 'http://localhost:3001/customers?page[number]=1',
      })
      assert.deepEqual(result.data, [])
      // ... after correctly retrieving records
      sinon.assert.calledWithExactly(getCustomersStub, {
        pageNumber: 1,
        pageSize: 10,
        sorting: {
          customer_id: 'ASC',
        },
      })
    })

    it('should return requested customers as expected', async () => {
      // given ... getting customers from DB will succeed
      const customers = Factories.Customer.build(5)
      const getCustomersStub = sandbox
        .stub(DbUtils, 'getCustomers')
        .returns(sandbox.stub().resolves({
          count: 5,
          rows: customers,
        }))

      // when ... we get customers
      const query = { filter: { firstName: 'an', lastName: 'b' }, sort: { firstName: 'ASC' } }
      const result = await SUT.getCustomers(query)

      // then
      // ... should succeed returning expected response
      assert.hasAllKeys(result, ['meta', 'links', 'data'])
      assert.deepEqual(result.meta, {
        currentPage: 1,
        firstRow: 1,
        pageSize: 10,
        totalPages: 1,
        totalRows: 5,
      })
      assert.deepEqual(result.links, {
        first: 'http://localhost:3001/customers?page[number]=1',
        last: 'http://localhost:3001/customers?page[number]=1',
        next: 'http://localhost:3001/customers?page[number]=2',
        prev: 'http://localhost:3001/customers?page[number]=1',
        self: 'http://localhost:3001/customers?page[number]=1',
      })
      assert.equal(result.data.length, 5)
      assert.hasAllKeys(result.data[0], R.keys(CUSTOMER_KEY_MAP))
      // ... after correctly retrieving records
      sinon.assert.calledWithExactly(getCustomersStub, {
        pageNumber: 1,
        pageSize: 10,
        sorting: {
          customer_id: 'ASC',
        },
      })
    })
  })

  describe('getCustomer', () => {
    it('should return requested customer as expected', async () => {
      // given ... getting customer from DB will succeed
      const customer = Factories.Customer.build(1)
      const getCustomerStub = sandbox
        .stub(DbUtils, 'getCustomer')
        .resolves(customer)

      // when ... we get a specific customer
      const result = await SUT.getCustomer(123)

      // then
      // ... should succeed returning expected response
      assert.hasAllKeys(result.data, R.keys(CUSTOMER_KEY_MAP))
      // ... after correctly retrieving records
      sinon.assert.calledWithExactly(getCustomerStub, 123)
    })
  })
})
