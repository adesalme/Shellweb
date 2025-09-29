import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database, User } from '../services/database';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT secret not configured', 500);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Get user from database
    const result = await Database.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 401);
    }

    req.user = result.rows[0];
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

export const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
};