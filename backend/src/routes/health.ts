import { Router, Request, Response } from 'express';
import { Database } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import axios from 'axios';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      powershell: 'unknown',
    }
  };

  // Check database connection
  try {
    await Database.query('SELECT 1');
    healthCheck.services.database = 'healthy';
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  // Check PowerShell executor
  try {
    const psExecutorUrl = process.env.POWERSHELL_EXECUTOR_URL || 'http://ps-executor:5001';
    const response = await axios.get(`${psExecutorUrl}/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      healthCheck.services.powershell = 'healthy';
    } else {
      healthCheck.services.powershell = 'unhealthy';
      healthCheck.status = 'degraded';
    }
  } catch (error) {
    healthCheck.services.powershell = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}));

export { router as healthRouter };