const R = require('ramda')

const ENUM_KEYS_VALUES = 'enum-keys-values'
const ENUM_KEYS = 'enum-keys'
const INT = 'int'

const queryParamTypes = {
  ENUM_KEYS_VALUES,
  ENUM_KEYS,
  INT,
}

module.exports.queryParamTypes = queryParamTypes

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
// extract query param
//-----------------------------------------

const extractQueryParamEnumKeysValues = ({ keys, values }) => R.pipe(
  R.toPairs,
  R.filter(([k, v]) => R.includes(k, keys) && R.includes(v, values)),
  R.fromPairs,
)

const extractQueryParamEnumKeys = ({ keys }) => R.pipe(
  R.toPairs,
  R.filter(([k]) => R.includes(k, keys)),
  R.fromPairs,
)

const extractQueryParamInt = () => x => parseInt(x, 10)

const extractQueryParamByType = type => R.pipe(
  // configure transformer functions for each type
  R.applySpec({
    [ENUM_KEYS_VALUES]: extractQueryParamEnumKeysValues,
    [ENUM_KEYS]: extractQueryParamEnumKeys,
    [INT]: extractQueryParamInt,
  }),
  // return transformer function for requested type
  fs => fs[type],
)

//-----------------------------------------
// transform query param
//-----------------------------------------

const transformQueryParamEnumKeyMapKeysValues = keyMap => ([x, y]) => (
  [R.propOr(x, x, keyMap), R.propOr(y, y, keyMap)]
)

const transformQueryParamEnumKeyMapKeys = keyMap => ([x, y]) => (
  [R.prop(x, keyMap), y]
)

const transformQueryParamEnumKeyMappers = {
  [ENUM_KEYS_VALUES]: transformQueryParamEnumKeyMapKeysValues,
  [ENUM_KEYS]: transformQueryParamEnumKeyMapKeys,
}

const transformQueryParamEnum = type => ({ key, baseValue, keyMap }) => R.pipe(
  R.objOf(key),
  R.mergeDeepRight(R.objOf(key, baseValue)),
  R.map(R.toPairs),
  R.ifElse(
    R.always(R.isNil(keyMap)),
    R.identity,
    R.map(R.map(transformQueryParamEnumKeyMappers[type](keyMap))),
  ),
)

const transformQueryParamInt = ({ key }) => R.ifElse(
  x => Number.isNaN(x),
  R.always({}),
  R.objOf(key),
)

const transformQueryParamByType = type => R.pipe(
  // configure transformer functions for each type
  R.applySpec({
    [ENUM_KEYS_VALUES]: transformQueryParamEnum(ENUM_KEYS_VALUES),
    [ENUM_KEYS]: transformQueryParamEnum(ENUM_KEYS),
    [INT]: transformQueryParamInt,
  }),
  // return transformer function for requested type
  fs => fs[type],
)

//-----------------------------------------
// extract query params
//-----------------------------------------

const extractQueryParams = (configs, keyMap) => data => (
  R.reduce((acc, { key, type, path, baseValue = {}, ...config }) => (
    R.pipe(
      R.path(path),
      extractQueryParamByType(type)(config),
      transformQueryParamByType(type)({ key, baseValue, keyMap }),
      R.mergeDeepRight(acc),
    )(data)
  ))({})(configs)
)

module.exports.extractQueryParams = extractQueryParams

//-----------------------------------------
// transform request body
//-----------------------------------------

const transformRequestBody = fieldMap => R.pipe(
  R.toPairs,
  R.map(([x, y]) => [R.propOr(null, x, fieldMap), y]),
  R.filter(R.pipe(R.head, R.isNil, R.not)),
  R.fromPairs,
)

module.exports.transformRequestBody = transformRequestBody



