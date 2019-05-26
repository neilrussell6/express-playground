const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const R = require('ramda')

const models = require('../../../../db/models/index')
const SUT = require('./db.utils')
const { CUSTOMER_PRIMARY_KEY } = require('./constants')
const { DoesNotExistError } = require('../../../common/db/db.errors')
const { ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST } = require('./constants')

chai.use(chaiAsPromised)

const { assert } = chai
const Factories = require('./factories')

describe('dvdrentals/customers/db.utils', () => {
  beforeEach(() => (
    models.sequelize.sync({ force: true, match: /_test$/ })
  ))

  describe('getCustomers', () => {
    it('should return all customers as expected', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3)
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we get all customers
      const baseParams = {}
      const config = {}
      const result = await SUT.getCustomers(baseParams)(config)

      // then ... should return row count and all requested rows
      assert.equal(result.count, 3)
      assert.deepEqual(R.pluck(CUSTOMER_PRIMARY_KEY)(result.rows), existingCustomerIds)
    })
  })

  describe('getCustomer', () => {
    it('should return request customer as expected', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3)
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we get 2nd customer
      const customer2Id = R.nth(1, existingCustomerIds)
      const result = await SUT.getCustomer(customer2Id)

      // then ... should return requested customer
      assert.equal(R.prop(CUSTOMER_PRIMARY_KEY, result), customer2Id)
    })

    it('should fail with does not exist error', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1)

      // when ... we attempt to get a customer that does not exist
      // then ... should fail with does not exist error
      await assert.isRejected(
        SUT.getCustomer(123),
        DoesNotExistError,
        ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST,
      )
    })
  })

  describe('createCustomer', () => {
    it('should create customer as expected', async () => {
      // given ... a store with address exists
      const store = await Factories.Store.create()
      const { store_id, address_id } = store

      // when ... we create a customer
      const customer = await Factories.Customer.build({
        first_name: 'NEW CUSTOMER',
      })
      const result = await SUT.createCustomer({ ...customer, store_id, address_id })

      // then ... should succeed and return new customer
      assert.equal(result.customer_id, 1)
      assert.equal(result.first_name, 'NEW CUSTOMER')
    })
  })

  describe('updateCustomer', () => {
    it('should update customer as expected', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3, {
        first_name: 'OLD NAME',
        activebool: true,
      })
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we update the 2nd customer
      const customer2Id = R.nth(1, existingCustomerIds)
      const result = await SUT.updateCustomer(customer2Id)({
        first_name: 'NEW NAME',
        activebool: false,
      })

      // then
      // ... should update and return 2nd customer as expected
      assert.equal(result.first_name, 'NEW NAME')
      assert.equal(result.activebool, false)
      const customer1 = await SUT.getCustomer(R.nth(0, existingCustomerIds))
      const customer2 = await SUT.getCustomer(R.nth(1, existingCustomerIds))
      const customer3 = await SUT.getCustomer(R.nth(2, existingCustomerIds))
      assert.equal(customer1.first_name, 'OLD NAME')
      assert.equal(customer2.first_name, 'NEW NAME')
      assert.equal(customer3.first_name, 'OLD NAME')
    })

    it('should fail with does not exist error', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1)

      // when ... we attempt to update a customer that does not exist
      // then ... should fail with does not exist error
      await assert.isRejected(
        SUT.updateCustomer(123)({ first_name: 'NEW NAME' }),
        DoesNotExistError,
        ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST,
      )
    })
  })

  describe('deleteCustomer', () => {
    it('should delete customer as expected', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3)
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we delete the 2nd customer
      const customer2Id = R.nth(1, existingCustomerIds)
      const result = await SUT.deleteCustomer(customer2Id)

      // then
      // ... should delete the 2nd customer and return null
      assert.equal(result, null)
      const customersResult = await SUT.getCustomers({})({})
      assert.equal(customersResult.count, 2)
      const customerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customersResult.rows)
      const customer1Id = R.nth(0, existingCustomerIds)
      const customer3Id = R.nth(2, existingCustomerIds)
      assert.includeMembers(customerIds, [customer1Id, customer3Id])
      assert.notIncludeMembers(customerIds, [customer2Id])
    })

    it('should fail with does not exist error', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1)

      // when ... we attempt to delete a customer that does not exist
      // then ... should fail with does not exist error
      await assert.isRejected(
        SUT.deleteCustomer(123),
        DoesNotExistError,
        ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST,
      )
    })
  })
})
