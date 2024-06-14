export const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UN_AUTHORISED: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    UNAUTHENTICATED: 401,
  };

  class BaseError extends Error {
    name: string;
    statusCode: number;

    constructor(name: string, statusCode: number, description: string) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
    }
}

// 500 Internal Error
class APIError extends BaseError {
  constructor(description = "api error") {
    super(
      "API internal server error",
      STATUS_CODES.INTERNAL_ERROR,
      description
    );
  }
}

// 400 BadRequest Error
class BadRequestError extends BaseError {
  constructor(description = "Bad request") {
    super("Bad request", STATUS_CODES.BAD_REQUEST, description);
  }
}

// 403 Authorize error
class AuthorizeError extends BaseError {
  constructor(description = "Access denied") {
    super("Access denied", STATUS_CODES.UN_AUTHORISED, description);
  }
}

// 404 Not Found
class NotFoundError extends BaseError {
  constructor(description = "Not found") {
    super("Not found", STATUS_CODES.NOT_FOUND, description);
  }
}

//401 Token Expired
class TokenExpiredError extends BaseError {
  constructor(description = "Token expired") {
    super("Token expired", STATUS_CODES.UNAUTHENTICATED, description);
  }
}

class RequestValidationError extends BaseError{
  constructor(description = "Request validation failed") {
    super('RequestValidationError', STATUS_CODES.BAD_REQUEST, description);
  }
}

  export {
    APIError,
    RequestValidationError,
    TokenExpiredError,
    AuthorizeError,
    NotFoundError,
    BadRequestError,
  }