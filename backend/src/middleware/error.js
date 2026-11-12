import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let body = { message: 'Something went wrong', code: 'INTERNAL_ERROR' };

  if (err instanceof AppError) {
    status = err.statusCode;
    body = { message: err.message, code: err.code, details: err.details };
  } else if (err instanceof ZodError) {
    status = 400;
    body = {
      message: err.issues[0]?.message || 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    body = { message: 'Malformed JSON body', code: 'BAD_JSON' };
  } else if (err.name === 'CastError') {
    status = 400;
    body = { message: `Invalid ${err.path}`, code: 'INVALID_ID' };
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    body = { message: `That ${field} is already in use`, code: 'DUPLICATE' };
  } else if (err.name === 'ValidationError') {
    status = 400;
    body = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    };
  }

  if (status >= 500) {
    console.error(err);
    if (!env.isProd) body.message = err.message;
  }

  res.status(status).json({ error: body });
}
