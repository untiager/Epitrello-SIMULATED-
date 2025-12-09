const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get activity log for a card
router.get('/card/:cardId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.name as user_name, u.email as user_email 
             FROM activity_logs a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.card_id = $1 
             ORDER BY a.created_at DESC`,
            [req.params.cardId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Get activity log for a board
router.get('/board/:boardId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.name as user_name, u.email as user_email, c.title as card_title 
             FROM activity_logs a 
             LEFT JOIN users u ON a.user_id = u.id 
             LEFT JOIN cards c ON a.card_id = c.id 
             LEFT JOIN lists l ON c.list_id = l.id 
             WHERE l.board_id = $1 
             ORDER BY a.created_at DESC 
             LIMIT 50`,
            [req.params.boardId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Create activity log entry
router.post('/', async (req, res) => {
    try {
        const { cardId, userId, action, details } = req.body;
        
        const result = await pool.query(
            'INSERT INTO activity_logs (card_id, user_id, action, details) VALUES ($1, $2, $3, $4) RETURNING *',
            [cardId, userId || null, action, details || '']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({ error: 'Failed to create activity log' });
    }
});

module.exports = router;
