const R = require('ramda')
const Bluebird = require('bluebird')

//-----------------------------------------
// factory : utils
//-----------------------------------------

const parseArgs = ([x = {}, y = {}]) => (
  R.applySpec({
    n: R.ifElse(R.is(Number), R.identity, R.always(1)),
    data: R.ifElse(R.is(Number), R.always(y), R.identity),
  })(x)
)

const headOrMultiple = R.ifElse(
  R.propSatisfies(R.gt(R.__, 1), 'length'),
  R.identity,
  R.head,
)

//-----------------------------------------
// factory : common build
//-----------------------------------------

const _build = base => R.pipe(
  ({ n, data }) => R.repeat(data, n),
  R.map(R.mergeRight(base)),
)

//-----------------------------------------
// factory : create
//-----------------------------------------

const modelCreate = model => R.ifElse(
  R.propSatisfies(R.gt(R.__, 1), 'length'),
  x => model.bulkCreate(x, { returning: true }),
  x => Bluebird
    .resolve(x)
    .then(R.head)
    .then(y => model.create(y))
    .then(y => [y]),
)

const factoryCreateAssociated = R.ifElse(
  R.is(Array),
  ([factory, field]) => Bluebird
    .resolve(factory.create())
    .then(R.propOr(null, field)),
  x => Bluebird.resolve(x),
)

const create = ({ model, base }) => data => Bluebird
  .resolve(data)
  .then(R.pipe(
    parseArgs,
    _build(base),
    R.map(R.toPairs),
  ))
  .map(xs => Bluebird
    .map(xs, ([k, v]) => factoryCreateAssociated(v)
      .then(x => [k, x])
    )
  )
  .then(R.map(R.fromPairs))
  .then(modelCreate(model))
  .then(R.pluck('dataValues'))
  .then(headOrMultiple)

//-----------------------------------------
// factory : build
//-----------------------------------------

const buildAssociated = ([factory, k]) => (
  R.propOr(null, k, factory.build())
)

const build = ({ base }) => R.pipe(
  parseArgs,
  _build(base),
  R.map(R.map(R.ifElse(R.is(Array), buildAssociated, R.identity))),
  headOrMultiple,
)

//-----------------------------------------
// factory
//-----------------------------------------

const Factory = (model, base) => ({
  create: (...xs) => create({ model, base })(xs),
  build: (...xs) => build({ base })(xs),
})

module.exports.Factory = Factory
