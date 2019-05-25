const R = require('ramda')
const Bluebird = require('bluebird')
const Sequelize = require('sequelize')

//-----------------------------------------
// paginate
//-----------------------------------------

const paginate = (model, pk, baseParams, config) => {
  const _config = R.mergeDeepRight(baseParams, config)

  // filter
  const filtering = R.propOr([], 'filtering', _config)
  const where = R.reduce((acc, [k, v]) => (
    R.mergeRight(acc, { [k]: { [Sequelize.Op.iLike]: `${v}%` } })
  ), {}, filtering)

  // sorting
  const sorting = R.propOr([], 'sorting', _config)
  const order = !R.isEmpty(sorting) && R.includes(pk, R.pluck(0, sorting))
    ? sorting
    : R.concat(sorting, [[pk, 'ASC']])

  // page / limit
  const pageSize = R.propOr(10, 'pageSize', _config)
  const limit = pageSize
  const offset = (R.propOr(1, 'pageNumber', _config) - 1) * pageSize

  // query
  const query = { where, order, limit, offset }
  return Bluebird
    .all([
      model.findAll(query).then(R.pluck('dataValues')),
      model.count({ where }),
    ])
    .then(R.zipObj(['rows', 'count']))
}

module.exports.paginate = paginate
