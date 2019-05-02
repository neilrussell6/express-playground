const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const models = require('../../../../db/models/index')
const SUT = require('./db.utils')

chai.use(chaiAsPromised)

const { assert } = chai

// --------------------------
// fixtures
// --------------------------

const country = {
  country: 'COUNTRY NAME',
}
const city = {
  city: 'CITY NAME',
}
const address = {
  address: 'ADDRESS LINE 1',
  address2: 'ADDRESS LINE 2',
  district: 'ADDRESS DISTRICT',
  postal_code: 'ADDRESS POSTAL CODE',
  phone: 'ADDRESS PHONE',
}
const staff = {
  first_name: 'STAFF FIRST NAME',
  last_name: 'STAFF LAST NAME',
  email: 'STAFF EMAIL',
  active: true,
  username: 'STAFF USERNAME',
  password: 'STAFF PASSWORD',
}
const store = {
  manager_staff_id: 1,
}
const customer = {
  first_name: 'CUSTOMER FIRST NAME',
  last_name: 'CUSTOMER LAST NAME',
  email: 'CUSTOMER EMAIL',
  activebool: true,
  active: 1,
}

describe('customers : db.utils', () => {
  beforeEach(async () => {
    await models.sequelize.sync({ force: true, match: /_test$/, logging: false })
  })

  describe('createCustomer', () => {
    it('should create customer as expected', async () => {
      // given ... a manager and store exist
      const _country = await models.Country.create(country)
      const _city = await models.City.create({ ...city, country_id: _country.country_id })
      const _address = await models.Address.create({ ...address, city_id: _city.city_id })
      const _store = await models.Store.create({ ...store, address_id: _address.address_id })
      // const staff = await models.Staff.create({ ...staff, address_id: address.id, store_id: store.id })
      // const customer = await models.Store.create({ ...customer, store_id: store.id, address_id: address.id })

      // when ... we create a customer
      const result = await SUT.createCustomer({ ...customer, store_id: _store.store_id, address_id: _address.address_id })

      // then ... should succeed and return new customer
      assert.equal(result.customer_id, 1)
    })
  })

  // describe('updateTransaction', () => {
  //   it('should update transaction as expected', async () => {
  //     // given ... transaction and user with a wallet exists
  //     const user = await models.User.create(user1)
  //     const userId = user.dataValues.id
  //     const wallet = await models.Wallet.create({ ...wallet1, user_id: userId })
  //     const walletId = wallet.id
  //     const transaction = await models.Transaction.create({ ...transaction1, wallet_id: walletId })
  //     const transactionId = transaction.id
  //
  //     // when ... we update the transaction
  //     const result = await SUT.updateTransaction(transactionId, {
  //       blockchain_transaction_id: 'BLOCKCHAIN TX ID',
  //       status: TRANSACTION_STATUS_COMPLETED,
  //       error_name: 'ERROR NAME',
  //       error_message: 'ERROR MESSAGE',
  //     })
  //
  //     // then ... should succeed and return updated transaction
  //     assert.equal(result.id, 1)
  //     assert.equal(result.wallet_id, walletId)
  //     assert.equal(result.blockchain_transaction_id, 'BLOCKCHAIN TX ID')
  //     assert.equal(result.status, TRANSACTION_STATUS_COMPLETED)
  //     assert.equal(result.error_name, 'ERROR NAME')
  //     assert.equal(result.error_message, 'ERROR MESSAGE')
  //   })
  //
  //   it('should throw DoesNotExistError if transaction does not exist', async () => {
  //     // given ... user with a wallet exists but not transaction 1234567890
  //     const user = await models.User.create(user1)
  //     const userId = user.dataValues.id
  //     await models.Wallet.create({ ...wallet1, user_id: userId })
  //
  //     // when ... we attempt to update a non-existant transaction
  //     // then ... should throw DoesNotExistError as expected
  //     await assert.isRejected(
  //         SUT.updateTransaction(1234567890, {}),
  //         DoesNotExistError,
  //         ERROR_MESSAGE_TRANSACTION_NOT_FOUND,
  //     )
  //   })
  // })
  //
  // describe('getTransaction', () => {
  //   it('should get transaction as expected', async () => {
  //     // given ... transaction and user with a wallet exists
  //     const user = await models.User.create(user1)
  //     const userId = user.dataValues.id
  //     const wallet = await models.Wallet.create({ ...wallet1, user_id: userId })
  //     const walletId = wallet.id
  //     const transaction = await models.Transaction.create({ ...transaction1, wallet_id: walletId })
  //     const transactionId = transaction.id
  //
  //     // when ... we get the transaction
  //     const result = await SUT.getTransaction(transactionId)
  //
  //     // then ... should succeed and return requested transaction
  //     assert.equal(result.id, 1)
  //     assert.equal(result.wallet_id, walletId)
  //   })
  //
  //   it('should throw DoesNotExistError if transaction does not exist', async () => {
  //     // given ... user with a wallet exists but not transaction 1234567890
  //     const user = await models.User.create(user1)
  //     const userId = user.dataValues.id
  //     await models.Wallet.create({ ...wallet1, user_id: userId })
  //
  //     // when ... we attempt to update a non-existant transaction
  //     // then ... should throw DoesNotExistError as expected
  //     await assert.isRejected(
  //         SUT.getTransaction(1234567890),
  //         DoesNotExistError,
  //         ERROR_MESSAGE_TRANSACTION_NOT_FOUND,
  //     )
  //   })
  // })
  //
  // describe('getTransactionByRef', () => {
  //   it('should get transaction by reference as expected', async () => {
  //     // given ... transaction and user with a wallet exists
  //     const user = await models.User.create(user1)
  //     const userId = user.dataValues.id
  //     const wallet = await models.Wallet.create({ ...wallet1, user_id: userId })
  //     const walletId = wallet.id
  //     const transaction = await models.Transaction.create({ ...transaction1, ref: '123', wallet_id: walletId })
  //     const transactionRef = transaction.ref
  //
  //     // when ... we get the transaction by reference
  //     const result = await SUT.getTransactionByRef(transactionRef)
  //
  //     // then ... should succeed and return requested transaction
  //     assert.equal(result.id, 1)
  //     assert.equal(result.wallet_id, walletId)
  //   })
  //
  //   it('should throw DoesNotExistError if transaction does not exist', async () => {
  //     // given ... there are no transactions
  //     // when ... we get the transaction by ref
  //     // then ... should throw DoesNotExistError as expected
  //     await assert.isRejected(
  //         SUT.getTransactionByRef('1234567890'),
  //         DoesNotExistError,
  //         ERROR_MESSAGE_TRANSACTION_NOT_FOUND,
  //     )
  //   })
  // })
})
