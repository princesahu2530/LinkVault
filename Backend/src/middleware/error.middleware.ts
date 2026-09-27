import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details;

  // Handle MongoDB Duplicate Key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid format for field "${err.path}"`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    details = {};
    for (const key of Object.keys(err.errors)) {
      details[key] = err.errors[key].message;
    }
  }

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - 500 Server Error`, {
      message: err.message,
      stack: ENV.NODE_ENV !== 'production' ? err.stack : undefined
    });
  } else {
    logger.debug(`[${req.method}] ${req.originalUrl} - ${statusCode} Client Error: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(ENV.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {})
    }
  });
}
