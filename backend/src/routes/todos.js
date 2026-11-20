const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply JWT authentication to all /api/todos routes
router.use(authMiddleware);

/**
 * GET /api/todos?search=&page=1&limit=10
 * Returns paginated list of todos strictly belonging to req.user.id.
 * Performs ILIKE matching on title and description.
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*)::int AS total FROM todos WHERE user_id = $1';
    let dataQuery = `
      SELECT id, user_id, title, description, completed, created_at, updated_at
      FROM todos
      WHERE user_id = $1
    `;
    const queryParams = [userId];

    if (search) {
      queryParams.push(`%${search}%`);
      const searchCondition = ` AND (title ILIKE $2 OR description ILIKE $2)`;
      countQuery += searchCondition;
      dataQuery += searchCondition;
    }

    // Execute count query
    const countResult = await db.query(countQuery, queryParams);
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Append ordering and pagination to data query
    const dataParams = [...queryParams];
    const limitParamIndex = dataParams.length + 1;
    const offsetParamIndex = dataParams.length + 2;
    dataParams.push(limit, offset);

    dataQuery += ` ORDER BY created_at DESC LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;

    const dataResult = await db.query(dataQuery, dataParams);

    return res.json({
      items: dataResult.rows,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/todos
 * Create a new todo strictly for req.user.id
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Todo title is required.' });
    }

    const trimmedTitle = title.trim();
    const cleanDescription = typeof description === 'string' ? description.trim() : '';

    const result = await db.query(
      `INSERT INTO todos (user_id, title, description, completed)
       VALUES ($1, $2, $3, false)
       RETURNING id, user_id, title, description, completed, created_at, updated_at`,
      [userId, trimmedTitle, cleanDescription]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/todos/:id
 * Toggle completion or edit title/description.
 * Strictly verifies ownership: returns 404 if not found, 403 if belongs to another user.
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, completed } = req.body;

    // 1. Check if the todo exists regardless of user
    const checkResult = await db.query('SELECT id, user_id FROM todos WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    // 2. Enforce strict ownership check
    const existingTodo = checkResult.rows[0];
    if (existingTodo.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to modify this todo.' });
    }

    // 3. Build dynamic update set
    const updates = [];
    const params = [id, userId];

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty.' });
      }
      params.push(title.trim());
      updates.push(`title = $${params.length}`);
    }

    if (description !== undefined) {
      params.push(typeof description === 'string' ? description.trim() : '');
      updates.push(`description = $${params.length}`);
    }

    if (completed !== undefined) {
      params.push(Boolean(completed));
      updates.push(`completed = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const updateQuery = `
      UPDATE todos
      SET ${updates.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, title, description, completed, created_at, updated_at
    `;

    const result = await db.query(updateQuery, params);

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/todos/:id
 * Delete a todo.
 * Strictly verifies ownership: returns 404 if not found, 403 if belongs to another user.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Check if todo exists
    const checkResult = await db.query('SELECT id, user_id FROM todos WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    // 2. Ownership check
    const existingTodo = checkResult.rows[0];
    if (existingTodo.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to delete this todo.' });
    }

    // 3. Delete todo
    await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);

    return res.json({
      message: 'Todo deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
