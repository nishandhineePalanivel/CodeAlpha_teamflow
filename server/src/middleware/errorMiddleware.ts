import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, status);
}
