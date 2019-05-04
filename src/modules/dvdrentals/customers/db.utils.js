const R = require('ramda')
const Bluebird = require('bluebird')
const Sequelize = require('sequelize')

const models = require('../../../../db/models/index')

const Op = Sequelize.Op

//-----------------------------------------
// get customers
//-----------------------------------------

const paginate = (model, pk, filteringFields, sortingFields, pageSize, pageNumber) => {
  const where = R.reduce((acc, [k, v]) => {
    return R.mergeRight(acc, { [k]: { [Op.iLike]: `${v}%` } })
  }, {}, filteringFields)
  return (
    Bluebird
      .all([
        model.findAll({
          where,
          order: R.includes(pk, R.pluck(0, sortingFields))
                 ? sortingFields
                 : R.concat(sortingFields, [[pk, 'ASC']]),
          limit: pageSize,
          offset: (pageNumber - 1) * pageSize,
        }),
        model.count({ where }),
      ])
      .then(R.zipObj(['rows', 'count']))
  )
}

const getCustomers = (...args) => paginate(models.Customer, 'customer_id', ...args)

module.exports.getCustomers = getCustomers

//-----------------------------------------
// create customer
//-----------------------------------------

const createCustomer = data => Bluebird
    .resolve(models.Customer.create(data))

module.exports.createCustomer = createCustomer
