const R = require('ramda')

const { DoesNotExistError } = require('../../../common/db/db.errors')
const handlers = require('./handlers')

module.exports = (app) => {
  app.route('/customers')
    // .all((req, res, next) => {
    //   next()
    // })
    .get((req, res) => handlers
      .getCustomers(req.query)
      .then(x => res.json(x))
      .catch(e => res.status(500).json({ errors: [e.message] }))
    )
    .post((req, res) => handlers
      .createCustomer(req.body)
      .then(x => res.status(201).json(x))
      .catch(e => res.status(500).json({ errors: [e.message] }))
    )

  app.route('/customers/:id')
    .get((req, res) => handlers
      .getCustomer(R.path(['params', 'id'], req))
      .then(x => res.json(x))
      .catch(DoesNotExistError, e => res.status(404).json({ errors: [e.message] }))
      .catch(e => res.status(500).json({ errors: [e.message] }))
    )
    .patch((req, res) => handlers
      .updateCustomer(R.path(['params', 'id'], req), R.prop('body', req))
      .then(x => res.status(200).json(x))
      .catch(DoesNotExistError, e => res.status(404).json({ errors: [e.message] }))
      .catch(e => res.status(500).json({ errors: [e.message] }))
    )
    .delete((req, res) => handlers
      .deleteCustomer(R.path(['params', 'id'], req))
      .then(() => res.status(204).json(null))
      .catch(DoesNotExistError, e => res.status(404).json({ errors: [e.message] }))
      .catch(e => res.status(500).json({ errors: [e.message] }))
    )
}
