const Factory = require('../../../common/factory')
const models = require('../../../../db/models/index')
const R = require('ramda')

const Country = Factory(models.Country, {
  country: 'COUNTRY NAME',
})
module.exports.Country = Country

const City = Factory(models.City, {
  city: 'CITY NAME',
  country_id: [Country, 'country_id'],
})
module.exports.City = City

const Address = Factory(models.Address, {
  address: 'ADDRESS LINE 1',
  address2: 'ADDRESS LINE 2',
  district: 'ADDRESS DISTRICT',
  postal_code: 'ADDRESS POSTAL CODE',
  phone: 'ADDRESS PHONE',
  city_id: [City, 'city_id'],
})
module.exports.Address = Address

const Store = Factory(models.Store, {
  manager_staff_id: 1,
  address_id: [Address, 'address_id'],
})
module.exports.Store = Store

const Customer = Factory(models.Customer, {
  first_name: 'CUSTOMER FIRST NAME',
  last_name: 'CUSTOMER LAST NAME',
  email: 'CUSTOMER EMAIL',
  activebool: true,
  active: 1,
  store_id: [Store, 'store_id'],
  address_id: [Address, 'address_id'],
})
module.exports.Customer = Customer
