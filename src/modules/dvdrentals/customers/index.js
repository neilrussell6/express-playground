const handlers = require('./handlers')

module.exports = (app) => {
  app.route('/customers')
    .all((req, res, next) => { next() })
    .get((req, res) => handlers
      .getCustomers(req.query)
      .then(x => res.json(x))
      .catch(e => res.status(400).json({ errors: [e.message] }))
    )
    .post((req, res) => handlers
      .createCustomer(req.body)
      .then(x => res.status(201).json(x))
    )
}
