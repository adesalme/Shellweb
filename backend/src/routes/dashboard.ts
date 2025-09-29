import { Router, Request, Response } from 'express';
import { Database } from '../services/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get basic counts
  const countsResult = await Database.query(`
    SELECT 
      (SELECT COUNT(*) FROM scripts WHERE is_deleted = false) as total_scripts,
      (SELECT COUNT(*) FROM executions) as total_executions,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(DISTINCT executor_id) FROM executions WHERE started_at >= NOW() - INTERVAL '30 days') as active_users_30d
  `);

  const counts = countsResult.rows[0];

  // Get top 5 most executed scripts
  const topScriptsResult = await Database.query(`
    SELECT 
      s.id,
      s.name,
      COUNT(e.id) as execution_count,
      u.display_name as creator_name
    FROM scripts s
    LEFT JOIN executions e ON s.id = e.script_id
    LEFT JOIN users u ON s.creator_id = u.id
    WHERE s.is_deleted = false
    GROUP BY s.id, s.name, u.display_name
    ORDER BY execution_count DESC
    LIMIT 5
  `);

  // Get daily executions for the last 30 days
  const dailyExecutionsResult = await Database.query(`
    SELECT 
      DATE(started_at) as date,
      COUNT(*) as executions,
      COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
      COUNT(CASE WHEN status = 'error' THEN 1 END) as failed,
      COUNT(CASE WHEN status = 'warning' THEN 1 END) as warnings
    FROM executions
    WHERE started_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(started_at)
    ORDER BY date DESC
  `);

  // Get role distribution
  const roleDistributionResult = await Database.query(`
    SELECT 
      role,
      COUNT(*) as count
    FROM users
    GROUP BY role
  `);

  // Get execution status distribution
  const statusDistributionResult = await Database.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM executions
    WHERE started_at >= NOW() - INTERVAL '30 days'
    GROUP BY status
  `);

  // Get recent activity
  const recentActivityResult = await Database.query(`
    SELECT 
      'execution' as type,
      e.id,
      s.name as script_name,
      u.display_name as user_name,
      e.status,
      e.started_at as timestamp
    FROM executions e
    LEFT JOIN scripts s ON e.script_id = s.id
    LEFT JOIN users u ON e.executor_id = u.id
    WHERE e.started_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'script_created' as type,
      s.id,
      s.name as script_name,
      u.display_name as user_name,
      'created' as status,
      s.created_at as timestamp
    FROM scripts s
    LEFT JOIN users u ON s.creator_id = u.id
    WHERE s.created_at >= NOW() - INTERVAL '7 days' AND s.is_deleted = false
    
    ORDER BY timestamp DESC
    LIMIT 10
  `);

  // Get average execution time
  const avgExecutionTimeResult = await Database.query(`
    SELECT 
      AVG(EXTRACT(EPOCH FROM (finished_at - started_at))) as avg_duration_seconds
    FROM executions
    WHERE finished_at IS NOT NULL 
    AND started_at >= NOW() - INTERVAL '30 days'
  `);

  const avgDuration = avgExecutionTimeResult.rows[0].avg_duration_seconds || 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalScripts: parseInt(counts.total_scripts),
        totalExecutions: parseInt(counts.total_executions),
        totalUsers: parseInt(counts.total_users),
        activeUsers30d: parseInt(counts.active_users_30d),
        avgExecutionTime: Math.round(avgDuration * 1000), // Convert to milliseconds
      },
      charts: {
        topScripts: topScriptsResult.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          executionCount: parseInt(row.execution_count),
          creatorName: row.creator_name,
        })),
        dailyExecutions: dailyExecutionsResult.rows.map((row: any) => ({
          date: row.date,
          total: parseInt(row.executions),
          successful: parseInt(row.successful),
          failed: parseInt(row.failed),
          warnings: parseInt(row.warnings),
        })),
        roleDistribution: roleDistributionResult.rows.map((row: any) => ({
          role: row.role,
          count: parseInt(row.count),
        })),
        statusDistribution: statusDistributionResult.rows.map((row: any) => ({
          status: row.status,
          count: parseInt(row.count),
        })),
      },
      recentActivity: recentActivityResult.rows.map((row: any) => ({
        type: row.type,
        id: row.id,
        scriptName: row.script_name,
        userName: row.user_name,
        status: row.status,
        timestamp: row.timestamp,
      })),
    },
  });
}));

// Get user-specific statistics
router.get('/user-stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Get user's script and execution counts
  const userStatsResult = await Database.query(`
    SELECT 
      (SELECT COUNT(*) FROM scripts WHERE creator_id = $1 AND is_deleted = false) as created_scripts,
      (SELECT COUNT(*) FROM executions WHERE executor_id = $1) as total_executions,
      (SELECT COUNT(*) FROM executions WHERE executor_id = $1 AND status = 'success') as successful_executions,
      (SELECT COUNT(*) FROM executions WHERE executor_id = $1 AND status = 'error') as failed_executions
  `, [userId]);

  const userStats = userStatsResult.rows[0];

  // Get user's most executed scripts
  const userTopScriptsResult = await Database.query(`
    SELECT 
      s.id,
      s.name,
      COUNT(e.id) as execution_count
    FROM scripts s
    LEFT JOIN executions e ON s.id = e.script_id AND e.executor_id = $1
    WHERE s.creator_id = $1 AND s.is_deleted = false
    GROUP BY s.id, s.name
    ORDER BY execution_count DESC
    LIMIT 5
  `, [userId]);

  // Get user's execution history over time
  const userExecutionHistoryResult = await Database.query(`
    SELECT 
      DATE(started_at) as date,
      COUNT(*) as executions
    FROM executions
    WHERE executor_id = $1 AND started_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(started_at)
    ORDER BY date DESC
  `, [userId]);

  res.json({
    success: true,
    data: {
      overview: {
        createdScripts: parseInt(userStats.created_scripts),
        totalExecutions: parseInt(userStats.total_executions),
        successfulExecutions: parseInt(userStats.successful_executions),
        failedExecutions: parseInt(userStats.failed_executions),
        successRate: userStats.total_executions > 0 
          ? Math.round((userStats.successful_executions / userStats.total_executions) * 100)
          : 0,
      },
      charts: {
        topScripts: userTopScriptsResult.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          executionCount: parseInt(row.execution_count),
        })),
        executionHistory: userExecutionHistoryResult.rows.map((row: any) => ({
          date: row.date,
          executions: parseInt(row.executions),
        })),
      },
    },
  });
}));

export { router as dashboardRouter };