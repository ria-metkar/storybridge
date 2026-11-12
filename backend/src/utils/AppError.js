export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const notFoundError = (what = 'Resource') => new AppError(`${what} not found`, 404, 'NOT_FOUND');
