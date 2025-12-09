const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
    if (!obj) return obj;
    const converted = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        converted[camelKey] = obj[key];
    }
    return converted;
};

// Get all lists for a board
router.get('/board/:boardId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
            [req.params.boardId]
        );
        res.json(result.rows.map(toCamelCase));
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
});

// Get a specific list
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lists WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({ error: 'Failed to fetch list' });
    }
});

// Create a new list
router.post('/', async (req, res) => {
    try {
        const position = req.body.position !== undefined ? req.body.position : 0;
        const result = await pool.query(
            'INSERT INTO lists (title, board_id, position) VALUES ($1, $2, $3) RETURNING *',
            [req.body.title || req.body.name, req.body.boardId, position]
        );
        res.status(201).json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// Update a list
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (req.body.title || req.body.name) {
            fields.push(`title = $${paramCount++}`);
            values.push(req.body.title || req.body.name);
        }
        if (req.body.position !== undefined) {
            fields.push(`position = $${paramCount++}`);
            values.push(req.body.position);
        }
        if (req.body.boardId) {
            fields.push(`board_id = $${paramCount++}`);
            values.push(req.body.boardId);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.params.id);
        const query = `UPDATE lists SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Failed to update list' });
    }
});

// Delete a list
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

module.exports = router;