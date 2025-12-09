const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get all comments for a card
router.get('/card/:cardId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name, u.email as user_email 
             FROM comments c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.card_id = $1 
             ORDER BY c.created_at ASC`,
            [req.params.cardId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Create a new comment
router.post('/', async (req, res) => {
    try {
        const { cardId, userId, content } = req.body;
        
        const result = await pool.query(
            'INSERT INTO comments (card_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [cardId, userId || null, content]
        );

        // Log activity
        await pool.query(
            'INSERT INTO activity_logs (card_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
            [cardId, userId || null, 'comment_added', `Added comment: ${content.substring(0, 50)}...`]
        );

        // Get user info if available
        if (userId) {
            const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                result.rows[0].user_name = userResult.rows[0].name;
                result.rows[0].user_email = userResult.rows[0].email;
            }
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Update a comment
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        
        const result = await pool.query(
            'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [content, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING card_id', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
