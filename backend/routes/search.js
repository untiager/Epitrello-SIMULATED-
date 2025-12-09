const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Advanced search endpoint
router.get('/', async (req, res) => {
    try {
        const { 
            query, 
            boardId, 
            dueDateFrom, 
            dueDateTo, 
            hasComments, 
            hasAttachments,
            sortBy,
            sortOrder 
        } = req.query;

        let sql = `
            SELECT DISTINCT c.*, 
                   l.title as list_title, 
                   l.board_id,
                   b.name as board_name,
                   COUNT(DISTINCT cm.id) as comment_count,
                   COUNT(DISTINCT a.id) as attachment_count
            FROM cards c
            LEFT JOIN lists l ON c.list_id = l.id
            LEFT JOIN boards b ON l.board_id = b.id
            LEFT JOIN comments cm ON c.id = cm.card_id
            LEFT JOIN attachments a ON c.id = a.card_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        // Text search in title and description
        if (query) {
            sql += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
            params.push(`%${query}%`);
            paramCount++;
        }

        // Filter by board
        if (boardId) {
            sql += ` AND l.board_id = $${paramCount}`;
            params.push(boardId);
            paramCount++;
        }

        // Filter by due date range
        if (dueDateFrom) {
            sql += ` AND c.due_date >= $${paramCount}`;
            params.push(dueDateFrom);
            paramCount++;
        }

        if (dueDateTo) {
            sql += ` AND c.due_date <= $${paramCount}`;
            params.push(dueDateTo);
            paramCount++;
        }

        // Group by for aggregates
        sql += ` GROUP BY c.id, l.title, l.board_id, b.name`;

        // Filter by comments
        if (hasComments === 'true') {
            sql += ` HAVING COUNT(DISTINCT cm.id) > 0`;
        }

        // Filter by attachments
        if (hasAttachments === 'true') {
            if (hasComments === 'true') {
                sql += ` AND COUNT(DISTINCT a.id) > 0`;
            } else {
                sql += ` HAVING COUNT(DISTINCT a.id) > 0`;
            }
        }

        // Sorting
        const validSortColumns = {
            'title': 'c.title',
            'dueDate': 'c.due_date',
            'createdAt': 'c.created_at',
            'comments': 'comment_count',
            'attachments': 'attachment_count'
        };

        const sortColumn = validSortColumns[sortBy] || 'c.created_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortColumn} ${order}`;

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching cards:', error);
        res.status(500).json({ error: 'Failed to search cards' });
    }
});

// Search boards
router.get('/boards', async (req, res) => {
    try {
        const { query } = req.query;

        let sql = 'SELECT * FROM boards WHERE 1=1';
        const params = [];

        if (query) {
            sql += ' AND (name ILIKE $1 OR description ILIKE $1)';
            params.push(`%${query}%`);
        }

        sql += ' ORDER BY created_at DESC';

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching boards:', error);
        res.status(500).json({ error: 'Failed to search boards' });
    }
});

// Get overdue cards
router.get('/overdue', async (req, res) => {
    try {
        const { boardId } = req.query;

        let sql = `
            SELECT c.*, l.title as list_title, b.name as board_name
            FROM cards c
            LEFT JOIN lists l ON c.list_id = l.id
            LEFT JOIN boards b ON l.board_id = b.id
            WHERE c.due_date < CURRENT_TIMESTAMP
        `;

        const params = [];
        if (boardId) {
            sql += ' AND l.board_id = $1';
            params.push(boardId);
        }

        sql += ' ORDER BY c.due_date ASC';

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching overdue cards:', error);
        res.status(500).json({ error: 'Failed to fetch overdue cards' });
    }
});

// Get cards due soon (next 7 days)
router.get('/due-soon', async (req, res) => {
    try {
        const { boardId } = req.query;

        let sql = `
            SELECT c.*, l.title as list_title, b.name as board_name
            FROM cards c
            LEFT JOIN lists l ON c.list_id = l.id
            LEFT JOIN boards b ON l.board_id = b.id
            WHERE c.due_date >= CURRENT_TIMESTAMP 
            AND c.due_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
        `;

        const params = [];
        if (boardId) {
            sql += ' AND l.board_id = $1';
            params.push(boardId);
        }

        sql += ' ORDER BY c.due_date ASC';

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cards due soon:', error);
        res.status(500).json({ error: 'Failed to fetch cards due soon' });
    }
});

module.exports = router;
