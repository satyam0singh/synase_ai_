// @ts-check
/* Typed error used by every domain API. */

export class ApiError extends Error {
  constructor(code, message, status = 500, details = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
  }
}
