const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
const axios = require('axios')
const R = require('ramda')

const models = require('../../../../db/models/index')
const { API_ENDPOINT_CUSTOMERS } = require('./constants')
const Factories = require('./factories')
const { CUSTOMER_PRIMARY_KEY } = require('./constants')
const { ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST } = require('./constants')

chai.use(chaiAsPromised)

const { assert } = chai

// --------------------------
// fixtures
// --------------------------

describe('dvdrentals/customers/handlers', () => {
  let sandbox = null

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    return models.sequelize.sync({ force: true, match: /_test$/ })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getCustomers', () => {
    it('should return expected success response', async () => {
      // given ... 3 customers exist
      await Factories.Customer.create(3)

      // when ... we get customers
      const result = await axios.get(API_ENDPOINT_CUSTOMERS)

      // then ... should succeed as expected
      assert.equal(result.status, 200)
      assert.equal(result.statusText, 'OK')
      assert.equal(result.headers['access-control-allow-origin'], '*')
      assert.match(result.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.data, ['meta', 'links', 'data'])
      assert.equal(result.data.data.length, 3)
    })

    it('should return expected success with no records response', async () => {
      // given ... no customers exist

      // when ... we get customers
      const result = await axios.get(API_ENDPOINT_CUSTOMERS)

      // then ... should succeed as expected
      assert.equal(result.status, 200)
      assert.equal(result.statusText, 'OK')
      assert.equal(result.headers['access-control-allow-origin'], '*')
      assert.match(result.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.data, ['meta', 'links', 'data'])
      assert.equal(result.data.data.length, 0)
    })
  })

  describe('getCustomer', () => {
    it('should return expected success response', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3)
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we get 2nd customer
      const customer2Id = R.nth(1, existingCustomerIds)
      const result = await axios.get(`${API_ENDPOINT_CUSTOMERS}/${customer2Id}`)

      // then ... should succeed as expected
      assert.equal(result.status, 200)
      assert.equal(result.statusText, 'OK')
      assert.equal(result.headers['access-control-allow-origin'], '*')
      assert.match(result.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.data, ['data'])
    })

    it('should return expected error not found response', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1)

      // when ... we attempt to get customer 123
      const result = await axios
        .get(`${API_ENDPOINT_CUSTOMERS}/123`)
        .catch(R.identity)

      // then ... should fail with not found as expected
      assert.equal(result.response.status, 404)
      assert.equal(result.response.statusText, 'Not Found')
      assert.equal(result.response.headers['access-control-allow-origin'], '*')
      assert.match(result.response.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.response.data, ['errors'])
      assert.includeMembers(result.response.data.errors, [ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST])
    })
  })

  describe('createCustomer', () => {
    it('should return expected success response', async () => {
      // given ... a store with address exists
      const store = await Factories.Store.create()
      const { store_id, address_id } = store

      // when ... we create a new customer
      // TODO: use RequestFactory
      const customer = {
        firstName: 'NEW CUSTOMER FIRST NAME',
        lastName: 'NEW CUSTOMER LAST NAME',
        store: store_id,
        address: address_id,
      }
      const result = await axios.post(`${API_ENDPOINT_CUSTOMERS}`, customer)

      // then ... should succeed as expected
      assert.equal(result.status, 201)
      assert.equal(result.statusText, 'Created')
      assert.equal(result.headers['access-control-allow-origin'], '*')
      assert.match(result.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.data, ['data'])
    })
  })

  describe('updateCustomer', () => {
    it('should return expected success response', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3, {
        first_name: 'OLD NAME',
        activebool: true,
      })
      const existingCustomerIds = R.pluck(CUSTOMER_PRIMARY_KEY)(customers)

      // when ... we update the 2nd customer
      const customer2Id = R.nth(1, existingCustomerIds)
      const customer = {
        firstName: 'NEW NAME',
        activebool: false,
      }
      const result = await axios.patch(`${API_ENDPOINT_CUSTOMERS}/${customer2Id}`, customer)

      // then ... should succeed as expected
      assert.equal(result.status, 200)
      assert.equal(result.statusText, 'OK')
      assert.equal(result.headers['access-control-allow-origin'], '*')
      assert.match(result.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.data, ['data'])
    })

    it('should return expected error not found response', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1, {
        first_name: 'OLD NAME',
        activebool: true,
      })

      // when ... we attempt to update customer 123
      const customer = {
        firstName: 'NEW NAME',
        activebool: false,
      }
      const result = await axios
        .patch(`${API_ENDPOINT_CUSTOMERS}/123`, customer)
        .catch(R.identity)

      // then ... should fail with not found as expected
      assert.equal(result.response.status, 404)
      assert.equal(result.response.statusText, 'Not Found')
      assert.equal(result.response.headers['access-control-allow-origin'], '*')
      assert.match(result.response.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.response.data, ['errors'])
      assert.includeMembers(result.response.data.errors, [ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST])
    })
  })

  describe('deleteCustomer', () => {
    it('should return expected success response', async () => {
      // given ... a customer exists
      const customer = await Factories.Customer.create(1)
      const customerId = R.prop(CUSTOMER_PRIMARY_KEY)(customer)

      // when ... we delete the customer
      const result = await axios.delete(`${API_ENDPOINT_CUSTOMERS}/${customerId}`)

      // then ... should succeed as expected
      assert.equal(result.status, 204)
      assert.equal(result.statusText, 'No Content')
      assert.equal(result.headers['access-control-allow-origin'], '*')
    })

    it('should return expected error not found response', async () => {
      // given ... a customer exists
      await Factories.Customer.create(1)

      // when ... we attempt to delete a customer that does not exist
      const result = await axios
        .delete(`${API_ENDPOINT_CUSTOMERS}/123`)
        .catch(R.identity)

      // then ... should fail with not found as expected
      assert.equal(result.response.status, 404)
      assert.equal(result.response.statusText, 'Not Found')
      assert.equal(result.response.headers['access-control-allow-origin'], '*')
      assert.match(result.response.headers['content-type'], /application\/json/)
      assert.hasAllKeys(result.response.data, ['errors'])
      assert.includeMembers(result.response.data.errors, [ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST])
    })
  })
})
