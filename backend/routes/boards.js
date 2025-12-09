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

// Get all boards
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
        res.json(result.rows.map(toCamelCase));
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

// Get a specific board
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM boards WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching board:', error);
        res.status(500).json({ error: 'Failed to fetch board' });
    }
});

// Create a new board
router.post('/', async (req, res) => {
    try {
        const result = await pool.query(
            'INSERT INTO boards (name, description) VALUES ($1, $2) RETURNING *',
            [req.body.name, req.body.description || '']
        );
        res.status(201).json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Failed to create board' });
    }
});

// Update a board
router.put('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE boards SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [req.body.name, req.body.description, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Failed to update board' });
    }
});

// Delete a board
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM boards WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

module.exports = router;