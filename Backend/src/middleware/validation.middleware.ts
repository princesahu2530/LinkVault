import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';
import mongoose from 'mongoose';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = formatZodError(result.error);
      return next(new ValidationError('Invalid request body payload', details));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = formatZodError(result.error);
      return next(new ValidationError('Invalid query parameters', details));
    }
    req.query = result.data;
    next();
  };
}

export function validateObjectId(paramName: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const val = req.params[paramName];
    if (!val || !mongoose.Types.ObjectId.isValid(val)) {
      return next(new ValidationError(`Invalid ObjectId format for parameter "${paramName}"`));
    }
    next();
  };
}

function formatZodError(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    formatted[path] = issue.message;
  }
  return formatted;
}
