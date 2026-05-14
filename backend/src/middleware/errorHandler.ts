import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const code = err.statusCode || 500;
  const msg  = err.isOperational ? err.message : 'Internal server error';
  console.error(`[${code}]`, err.message);
  res.status(code).json({ message: msg });
};
