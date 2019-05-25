const R = require('ramda')

//-----------------------------------------
// convert path to query param
//-----------------------------------------

const pathToUrlQueryParam = path => (
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

const transformResponse = keyMap => data => R.pipe(
  R.toPairs,
  R.map(([x, y]) => [x, R.propOr(null, y, data)]),
  R.fromPairs,
)(keyMap)

module.exports.transformResponse = transformResponse

//-----------------------------------------
// rebuild extra query params
//-----------------------------------------

const rebuildExtraQueryParams = queryParams => R.pipe(
  // ... exclude params not in config
  R.filter(R.compose(R.not, R.isNil, R.path(R.__, queryParams), R.prop('path'))),
  // ... build values [a, b, c, d]
  R.reduce((acc, x) => R.pipe(
    R.prop('path'),
    path => R.pipe(
      R.path(R.__, queryParams),
      R.ifElse(
        R.is(Object),
        R.compose(R.toPairs, R.pick(R.prop('keys', x))),
        y => [[y]],
      ),
      R.map(R.concat(path)),
      R.concat(acc),
    )(path),
  )(x), []),
  // ... exclude nulls
  R.filter(R.compose(R.not, R.isNil, R.last)),
  // ... build string a[b][c]=d
  R.map(R.pipe(
    path => R.pipe(
      R.compose(R.join(']['), R.slice(1, -1)),
      R.ifElse(
        R.isEmpty,
        () => `${R.head(path)}=${R.last(path)}`,
        x => `${R.head(path)}[${x}]=${R.last(path)}`,
      ),
    )(path),
  )),
  // ... join with &
  R.join('&'),
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
  pageSize,
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

const buildPaginationResponse = (
  endpoint,
  baseParams,
  queryParams,
  queryParamsConfig,
  rows,
  count,
) => {
  const params = R.mergeDeepRight(baseParams, queryParams)
  const { pageNumber, pageSize } = params
  const _queryParams = R.dissocPath(['page', 'number'])(queryParams)
  const extraQueryParams = rebuildExtraQueryParams(_queryParams)(queryParamsConfig)
  return ({
    meta: buildPaginationResponsePaginationMeta(count, pageNumber, pageSize),
    links: R.compose(
      // TODO: move ifElse to rebuildExtraQueryParams
      R.map(x => R.ifElse(
        R.isEmpty,
        R.always(`${endpoint}?${x}`),
        y => `${endpoint}?${x}&${y}`,
      )(extraQueryParams)),
    )(buildPaginationResponsePaginationLinks(count, pageNumber, pageSize)),
    data: rows,
  })
}

module.exports.buildPaginationResponse = buildPaginationResponse
