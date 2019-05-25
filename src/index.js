const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const customers = require('./modules/dvdrentals/customers')

const app = express()
app.use(bodyParser.json())
app.use(cors())

customers(app)

app.listen(3001, () => {
  console.log('running on http://localhost:3001/') // eslint-disable-line no-console
})
