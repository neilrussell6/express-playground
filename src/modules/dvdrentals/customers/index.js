const R = require('ramda')

const handlers = require('./handlers')

module.exports = (app) => {
  app.route('/customers')
    .all((req, res, next) => {
      next()
    })
    .get((req, res) => handlers
      .getCustomers(req.query)
      .then(x => res.json(x))
      .catch(e => res.status(400).json({ errors: [e.message] }))
    )
    .post((req, res) => handlers
      .createCustomer(req.body)
      .then(x => res.status(201).json(x))
    )

  app.route('/customers/:id')
    .patch((req, res) => handlers
      .updateCustomer(R.path(['params', 'id'], req), R.prop('body', req))
      .then(x => res.status(200).json(x))
    )
}
