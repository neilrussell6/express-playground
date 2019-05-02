const R = require('ramda')

//-----------------------------------------
// convert path to query param
//-----------------------------------------

const pathToUrlQueryParam = (path) => (
  R.pipe(
    R.tail,
    R.map(x => `[${x}]`),
    R.concat([R.head(path)]),
    R.join(''),
  )(path)
)
module.exports.pathToUrlQueryParam = pathToUrlQueryParam

//-----------------------------------------
// extract query params
//-----------------------------------------

const _extractEnumQueryParam = (paramKey, { defaultValue, path, options }) => R.pipe(
  R.pathOr(null, path),
  R.ifElse(R.isNil, R.always(defaultValue),
    R.ifElse(R.includes(R.__, options), R.identity,
      x => { throw new Error(`invalid value ${x} for ${pathToUrlQueryParam(path)}`) }
    )
  ),
)
const extractEnumQueryParam = R.uncurryN(2, _extractEnumQueryParam)

const _extractIntQueryParam = (paramKey, { defaultValue, path }) => R.pipe(
  R.pathOr(null, path),
  R.ifElse(R.isNil, R.always(defaultValue),
      x => R.pipe(
        y => parseInt(y),
        R.ifElse(y => !Number.isNaN(y) && y > 0, R.identity,
          () => { throw new Error(`invalid value ${x} for ${pathToUrlQueryParam(path)}`) }
        ),
      )(x)
  ),
)
const extractIntQueryParam = R.uncurryN(2, _extractIntQueryParam)

const _extractStringQueryParam = (paramKey, { defaultValue, path }) => R.pipe(
  R.pathOr(null, path),
  R.ifElse(R.isNil, R.always(defaultValue), R.identity),
)
const extractStringQueryParam = R.uncurryN(2, _extractStringQueryParam)

const QUERY_PARAM_TYPE_MAP =  {
  enum: extractEnumQueryParam,
  int: extractIntQueryParam,
  string: extractStringQueryParam,
}

const getExtractorFnByType = R.pipe(
  R.prop('type'),
  R.prop(R.__, QUERY_PARAM_TYPE_MAP),
)

const extractQueryParams = config => data => R.pipe(
  R.toPairs,
  R.reduce((acc, [k, v]) => (
    R.mergeRight(acc, {
      [k]: getExtractorFnByType(v)(k, v, data),
    })
  ), {})
)(config)

module.exports.extractQueryParams = extractQueryParams
