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
// transform response
//-----------------------------------------

const transformResponse = fieldMap => R.pipe(
  x => R.reduce((acc, [k1, k2]) => (
    R.mergeRight(acc, { [k2]: R.prop(k1, x) })
  ), {}, R.toPairs(fieldMap)),
)

module.exports.transformResponse = transformResponse

//-----------------------------------------
// rebuild extra query params
//-----------------------------------------

const rebuildExtraQueryParams = queryParams => R.pipe(
  R.pluck('path'),
  R.mapObjIndexed((i, k, obj) => [
    pathToUrlQueryParam(obj[k]),
    R.pathOr(null, obj[k], queryParams),
  ]),
  R.filter(R.pipe(R.last, R.isNil, R.not)),
  R.omit(['pageNumber']),
  R.values,
  R.map(R.join('=')),
  R.join('&'),
  R.ifElse(R.isEmpty, R.always(''), x => `&${x}`),
)
module.exports.rebuildExtraQueryParams = rebuildExtraQueryParams

//-----------------------------------------
// build pagination response
//-----------------------------------------

const buildPaginationResponsePaginationMeta = (count, pageNumber, pageSize) => ({
  firstRow: ((pageNumber - 1) * pageSize) + 1,
  totalRows: count,
  currentPage: pageNumber,
  totalPages: Math.ceil(count / pageSize),
})

const buildPaginationResponsePaginationLinks = (count, pageNumber, pageSize) => {
  const self = `page[number]=${pageNumber}`
  return {
    self,
    prev: pageNumber - 1 < 1 ? self : `page[number]=${pageNumber - 1}`,
    next: pageNumber + 1 >= count ? self : `page[number]=${pageNumber + 1}`,
    first: 'page[number]=1',
    last: `page[number]=${Math.ceil(count / pageSize)}`,
  }
}

const buildPaginationResponse = (endpoint, queryParams, queryParamsConfig, pageNumber, pageSize, rows, count) => {
  const extraQueryParams = rebuildExtraQueryParams(queryParams)(queryParamsConfig)
  return ({
    meta: buildPaginationResponsePaginationMeta(count, pageNumber, pageSize),
    links: R.compose(
      R.map(x => `${endpoint}?${x}${extraQueryParams}`),
    )(buildPaginationResponsePaginationLinks(count, pageNumber, pageSize)),
    data: rows,
  })
}

module.exports.buildPaginationResponse = buildPaginationResponse
