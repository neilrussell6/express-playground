const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')

const SUT = require('./handlers')
const DbUtils = require('./db.utils')

chai.use(chaiAsPromised)

const { assert } = chai

// --------------------------
// fixtures
// --------------------------

describe('handlers', () => {
  let sandbox = null

  beforeEach(async () => {
    sandbox = await sinon.createSandbox()
  })

  afterEach(async () => {
    await sandbox.restore()
  })

  describe.only('getCustomers', () => {
    it('should returns requested customers as expected', async () => {
      // given ... getting customers from DB will succeed
      const getCustomersStub = sandbox.stub(DbUtils, 'getCustomers').resolves({ count: 0, rows: [] })

      // when ... we get customers
      const query = { filter: { firstName: 'an', lastName: 'b' }, sort: { firstName: 'ASC' } }
      const result = await SUT.getCustomers(query)

      // then
      // ... should succeed returning expected response
      assert.deepEqual(result.meta, {
        firstRow: NaN,
        totalRows: 0,
        currentPage: undefined,
        totalPages: NaN,
      })
      assert.deepEqual(result.links, {
        self: 'undefined/customers?page[number]=undefined&sort=[object Object]&filter=[object Object]',
        prev: 'undefined/customers?page[number]=NaN&sort=[object Object]&filter=[object Object]',
        next: 'undefined/customers?page[number]=NaN&sort=[object Object]&filter=[object Object]',
        first: 'undefined/customers?page[number]=1&sort=[object Object]&filter=[object Object]',
        last: 'undefined/customers?page[number]=NaN&sort=[object Object]&filter=[object Object]',
      })
      assert.deepEqual(result.data, [])
      // ....
    })
  })
})
