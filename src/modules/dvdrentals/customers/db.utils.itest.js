const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const R = require('ramda')

const models = require('../../../../db/models/index')
const SUT = require('./db.utils')

chai.use(chaiAsPromised)

const { assert } = chai
const Factories = require('./factories')

describe('dvdrentals/customers/db.utils', () => {
  beforeEach(async () => {
    await models.sequelize.sync({ force: true, match: /_test$/ })
  })

  describe('createCustomer', () => {
    it('should create customer as expected', async () => {
      // given ... a store with address exist
      const store = await Factories.Store.create()
      const store_id = store.store_id
      const address_id = store.address_id

      // when ... we create a customer
      const customer = await Factories.Customer.build()
      const result = await SUT.createCustomer({ ...customer, store_id, address_id })

      // then ... should succeed and return new customer
      assert.equal(result.customer_id, 1)
    })
  })

  describe('getCustomers', () => {
    it('should return all customers as expected', async () => {
      // given ... 3 customers exist
      const customers = await Factories.Customer.create(3)
      const existing_customer_ids = R.pluck('customer_id')(customers)

      // when ... we get all customers
      const result = await SUT.getCustomers()

      // then ... should return row count and all requested rows
      assert.equal(result.count, 3)
      assert.deepEqual(R.pluck('customer_id')(result.rows), existing_customer_ids)
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
