import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'No token' }); return; }
    const token = header.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
