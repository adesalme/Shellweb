import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { Database, User } from '../services/database';
import { generateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Local authentication (standalone mode)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { email, password, displayName } = req.body;

  try {
    // Check if user exists
    let result = await Database.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user: User;

    if (result.rows.length === 0) {
      // Create new user in standalone mode
      if (process.env.REACT_APP_STANDALONE_MODE === 'true') {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        
        result = await Database.query(`
          INSERT INTO users (email, display_name, role) 
          VALUES ($1, $2, $3) 
          RETURNING *
        `, [email, displayName || email.split('@')[0], 'dev']);
        
        user = result.rows[0];
      } else {
        throw createError('User not found', 401);
      }
    } else {
      user = result.rows[0];
      
      // In standalone mode with password, verify it
      if (password && user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw createError('Invalid credentials', 401);
        }
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
}));

// Azure AD token verification
router.post('/azure/verify', [
  body('accessToken').notEmpty(),
  body('userInfo').isObject(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { accessToken, userInfo } = req.body;

  try {
    // In a real implementation, you would verify the Azure AD token
    // For this demo, we'll trust the frontend validation
    
    const { oid, email, name } = userInfo;

    // Check if user exists
    let result = await Database.query(
      'SELECT * FROM users WHERE azure_oid = $1 OR email = $2',
      [oid, email]
    );

    let user: User;

    if (result.rows.length === 0) {
      // Create new user
      result = await Database.query(`
        INSERT INTO users (azure_oid, email, display_name, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [oid, email, name, 'dev']);
      
      user = result.rows[0];
    } else {
      user = result.rows[0];
      
      // Update user info if needed
      if (!user.azure_oid && oid) {
        await Database.query(
          'UPDATE users SET azure_oid = $1, display_name = $2 WHERE id = $3',
          [oid, name, user.id]
        );
        user.azure_oid = oid;
        user.display_name = name;
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        azureOid: user.azure_oid,
      },
    });
  } catch (error) {
    throw error;
  }
}));

// Get current user info
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw createError('Access token required', 401);
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    const result = await Database.query(
      'SELECT id, email, display_name, role, azure_oid, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 401);
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        azureOid: user.azure_oid,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw createError('Token expired', 401);
    } else {
      throw error;
    }
  }
}));

export { router as authRouter };