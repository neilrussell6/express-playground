// ----------------------------------------------
// error messages
// ----------------------------------------------

const ERROR_MESSAGE_DB_ERROR = 'An error occurred while attempting to query database'
const ERROR_MESSAGE_DB_CONNECTION = 'Could not establish DB connection'
const ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST = 'Requested resource does not exist'

const ERROR_DB_ERROR = 'DbError'
const ERROR_DB_CONNECTION = 'DbConnectionError'
const ERROR_DB_DOES_NOT_EXIST = 'DoesNotExistError'

// ----------------------------------------------
// db error
// ----------------------------------------------

function DbError(message) {
  this.message = message
  this.name = ERROR_DB_ERROR
  Error.captureStackTrace(this, DbError)
}
DbError.prototype = Object.create(Error.prototype)
DbError.prototype.constructor = DbError

// ----------------------------------------------
// db connection error
// ----------------------------------------------

function DbConnectionError(message) {
  this.message = message
  this.name = ERROR_DB_CONNECTION
  Error.captureStackTrace(this, DbConnectionError)
}
DbConnectionError.prototype = Object.create(Error.prototype)
DbConnectionError.prototype.constructor = DbConnectionError

// ----------------------------------------------
// does not exist
// ----------------------------------------------

function DoesNotExistError(message) {
  this.message = message
  this.name = ERROR_DB_DOES_NOT_EXIST
  Error.captureStackTrace(this, DoesNotExistError)
}
DoesNotExistError.prototype = Object.create(Error.prototype)
DoesNotExistError.prototype.constructor = DoesNotExistError

// ----------------------------------------------

module.exports = {
  ERROR_MESSAGE_DB_ERROR,
  ERROR_MESSAGE_DB_CONNECTION,
  ERROR_MESSAGE_DB_RESOURCE_DOES_NOT_EXIST,
  ERROR_DB_ERROR,
  ERROR_DB_CONNECTION,
  ERROR_DB_DOES_NOT_EXIST,
  DbError,
  DbConnectionError,
  DoesNotExistError,
}
