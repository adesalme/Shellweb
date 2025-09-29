import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import { Database, ExecutionWithDetails } from '../services/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// All execution routes require authentication
router.use(authenticateToken);

// Execute script
router.post('/', [
  body('scriptId').isUUID(),
  body('azureToken').optional().isString(),
  body('userEmail').optional().isEmail(),
  body('tenantId').optional().isString(),
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { scriptId, azureToken, userEmail, tenantId } = req.body;
  const userId = req.user!.id;

  // Get script
  const scriptResult = await Database.query(
    'SELECT * FROM scripts WHERE id = $1 AND is_deleted = false',
    [scriptId]
  );

  if (scriptResult.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  const script = scriptResult.rows[0];

  // Create execution record
  const executionResult = await Database.query(`
    INSERT INTO executions (script_id, executor_id, started_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `, [scriptId, userId]);

  const execution = executionResult.rows[0];

  try {
    // Call PowerShell executor
    const psExecutorUrl = process.env.POWERSHELL_EXECUTOR_URL || 'http://ps-executor:5001';
    
    const payload = {
      script: script.content,
      azureToken,
      userEmail: userEmail || req.user!.email,
      tenantId,
    };

    console.log(`Executing script ${scriptId} for user ${userId}`);
    
    const response = await axios.post(`${psExecutorUrl}/run`, payload, {
      timeout: 300000, // 5 minutes timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = response.data;

    // Update execution record with results
    const updateResult = await Database.query(`
      UPDATE executions 
      SET 
        finished_at = NOW(),
        status = $1,
        stdout = $2,
        stderr = $3,
        exit_code = $4
      WHERE id = $5
      RETURNING *
    `, [
      result.status,
      result.stdout,
      result.stderr,
      result.exitCode,
      execution.id,
    ]);

    const updatedExecution = updateResult.rows[0];

    res.json({
      success: true,
      data: {
        executionId: updatedExecution.id,
        status: updatedExecution.status,
        exitCode: updatedExecution.exit_code,
        stdout: updatedExecution.stdout,
        stderr: updatedExecution.stderr,
        startedAt: updatedExecution.started_at,
        finishedAt: updatedExecution.finished_at,
        durationMs: result.durationMs,
      },
      message: `Script executed with status: ${result.status}`,
    });

  } catch (error: any) {
    console.error('PowerShell execution error:', error.message);
    
    // Update execution record with error
    await Database.query(`
      UPDATE executions 
      SET 
        finished_at = NOW(),
        status = 'error',
        stderr = $1,
        exit_code = -1
      WHERE id = $2
    `, [
      error.message || 'Unknown execution error',
      execution.id,
    ]);

    throw createError(`Script execution failed: ${error.message}`, 500);
  }
}));

// Get execution details
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await Database.query(`
    SELECT 
      e.*,
      s.name as script_name,
      u.display_name as executor_name
    FROM executions e
    LEFT JOIN scripts s ON e.script_id = s.id
    LEFT JOIN users u ON e.executor_id = u.id
    WHERE e.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Execution not found', 404);
  }

  const execution = result.rows[0];

  // Check if user can view this execution
  if (execution.executor_id !== req.user!.id && req.user!.role !== 'admin') {
    throw createError('Not authorized to view this execution', 403);
  }

  res.json({
    success: true,
    data: execution,
  });
}));

// Get executions for a script
router.get('/script/:scriptId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scriptId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // Check if script exists and user has access
  const scriptResult = await Database.query(
    'SELECT creator_id FROM scripts WHERE id = $1 AND is_deleted = false',
    [scriptId]
  );

  if (scriptResult.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  const script = scriptResult.rows[0];

  // Only creator, admin, or executor can view executions
  let whereClause = 'WHERE e.script_id = $1';
  const params = [scriptId];

  if (req.user!.role !== 'admin' && script.creator_id !== req.user!.id) {
    whereClause += ' AND e.executor_id = $2';
    params.push(req.user!.id);
  }

  const result = await Database.query(`
    SELECT 
      e.*,
      u.display_name as executor_name
    FROM executions e
    LEFT JOIN users u ON e.executor_id = u.id
    ${whereClause}
    ORDER BY e.started_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `, [...params, limit, offset]);

  // Get total count
  const countResult = await Database.query(`
    SELECT COUNT(*) as total
    FROM executions e
    ${whereClause}
  `, params);

  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

// Get user's execution history
router.get('/user/history', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const result = await Database.query(`
    SELECT 
      e.*,
      s.name as script_name
    FROM executions e
    LEFT JOIN scripts s ON e.script_id = s.id
    WHERE e.executor_id = $1
    ORDER BY e.started_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);

  // Get total count
  const countResult = await Database.query(
    'SELECT COUNT(*) as total FROM executions WHERE executor_id = $1',
    [userId]
  );

  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

export { router as executionsRouter };