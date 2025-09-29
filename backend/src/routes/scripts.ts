import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Database, ScriptWithUser } from '../services/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// All script routes require authentication
router.use(authenticateToken);

// Get scripts with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('creator').optional().isUUID(),
  query('search').optional().isLength({ min: 1, max: 100 }),
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const creator = req.query.creator as string;
  const search = req.query.search as string;

  let whereClause = 'WHERE s.is_deleted = false';
  const params: any[] = [];
  let paramCount = 0;

  if (creator) {
    paramCount++;
    whereClause += ` AND s.creator_id = $${paramCount}`;
    params.push(creator);
  }

  if (search) {
    paramCount++;
    whereClause += ` AND (s.name ILIKE $${paramCount} OR s.content ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  const query = `
    SELECT 
      s.*,
      creator.display_name as creator_name,
      modifier.display_name as last_modified_by_name,
      COUNT(e.id) as execution_count
    FROM scripts s
    LEFT JOIN users creator ON s.creator_id = creator.id
    LEFT JOIN users modifier ON s.last_modified_by = modifier.id
    LEFT JOIN executions e ON s.id = e.script_id
    ${whereClause}
    GROUP BY s.id, creator.display_name, modifier.display_name
    ORDER BY s.updated_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  params.push(limit, offset);

  const result = await Database.query(query, params);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM scripts s
    ${whereClause}
  `;
  const countResult = await Database.query(countQuery, params.slice(0, -2));
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

// Get single script
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await Database.query(`
    SELECT 
      s.*,
      creator.display_name as creator_name,
      modifier.display_name as last_modified_by_name,
      COUNT(e.id) as execution_count
    FROM scripts s
    LEFT JOIN users creator ON s.creator_id = creator.id
    LEFT JOIN users modifier ON s.last_modified_by = modifier.id
    LEFT JOIN executions e ON s.id = e.script_id
    WHERE s.id = $1 AND s.is_deleted = false
    GROUP BY s.id, creator.display_name, modifier.display_name
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
}));

// Create new script
router.post('/', [
  body('name').notEmpty().isLength({ max: 255 }),
  body('content').notEmpty().isLength({ max: 200000 }), // 200KB limit
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { name, content } = req.body;
  const userId = req.user!.id;

  const result = await Database.query(`
    INSERT INTO scripts (name, content, creator_id, last_modified_by)
    VALUES ($1, $2, $3, $3)
    RETURNING *
  `, [name, content, userId]);

  res.status(201).json({
    success: true,
    data: result.rows[0],
    message: 'Script created successfully',
  });
}));

// Update script
router.put('/:id', [
  body('name').optional().isLength({ max: 255 }),
  body('content').optional().isLength({ max: 200000 }),
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { id } = req.params;
  const { name, content } = req.body;
  const userId = req.user!.id;

  // Check if script exists and user has permission
  const existingScript = await Database.query(
    'SELECT * FROM scripts WHERE id = $1 AND is_deleted = false',
    [id]
  );

  if (existingScript.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  const script = existingScript.rows[0];
  
  // Only creator or admin can edit
  if (script.creator_id !== userId && req.user!.role !== 'admin') {
    throw createError('Not authorized to edit this script', 403);
  }

  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(name);
  }

  if (content !== undefined) {
    paramCount++;
    updates.push(`content = $${paramCount}`);
    params.push(content);
  }

  if (updates.length === 0) {
    throw createError('No updates provided', 400);
  }

  paramCount++;
  updates.push(`last_modified_by = $${paramCount}`);
  params.push(userId);

  paramCount++;
  params.push(id);

  const result = await Database.query(`
    UPDATE scripts 
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `, params);

  res.json({
    success: true,
    data: result.rows[0],
    message: 'Script updated successfully',
  });
}));

// Delete script (soft delete)
router.delete('/:id', requireRole(['admin']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await Database.query(
    'UPDATE scripts SET is_deleted = true WHERE id = $1 AND is_deleted = false RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  res.json({
    success: true,
    message: 'Script deleted successfully',
  });
}));

// Export script
router.get('/:id/export', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await Database.query(`
    SELECT 
      s.*,
      creator.display_name as creator_name
    FROM scripts s
    LEFT JOIN users creator ON s.creator_id = creator.id
    WHERE s.id = $1 AND s.is_deleted = false
  `, [id]);

  if (result.rows.length === 0) {
    throw createError('Script not found', 404);
  }

  const script = result.rows[0];
  
  const exportData = {
    metadata: {
      id: script.id,
      name: script.name,
      creator: script.creator_name,
      createdAt: script.created_at,
      updatedAt: script.updated_at,
      exportedAt: new Date().toISOString(),
      exportedBy: req.user!.display_name || req.user!.email,
    },
    script: script.content,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${script.name}.json"`);
  res.json(exportData);
}));

// Import script
router.post('/import', [
  body('data').isObject(),
], asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { data } = req.body;
  const userId = req.user!.id;

  if (!data.metadata || !data.script) {
    throw createError('Invalid import format', 400);
  }

  const { metadata, script } = data;
  
  if (!metadata.name || !script) {
    throw createError('Missing required fields in import data', 400);
  }

  const result = await Database.query(`
    INSERT INTO scripts (name, content, creator_id, last_modified_by)
    VALUES ($1, $2, $3, $3)
    RETURNING *
  `, [metadata.name, script, userId]);

  res.status(201).json({
    success: true,
    data: result.rows[0],
    message: 'Script imported successfully',
  });
}));

export { router as scriptsRouter };