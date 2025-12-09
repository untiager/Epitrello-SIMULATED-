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

// Get all cards for a list
router.get('/list/:listId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cards WHERE list_id = $1 ORDER BY position',
            [req.params.listId]
        );
        res.json(result.rows.map(toCamelCase));
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Get a specific card
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cards WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

// Create a new card
router.post('/', async (req, res) => {
    try {
        const position = req.body.position !== undefined ? req.body.position : 0;
        const result = await pool.query(
            'INSERT INTO cards (title, description, list_id, position, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [
                req.body.title,
                req.body.description || '',
                req.body.listId,
                position,
                req.body.dueDate || null
            ]
        );
        
        // Handle attachments if provided
        if (req.body.attachments && req.body.attachments.length > 0) {
            for (const attachment of req.body.attachments) {
                await pool.query(
                    'INSERT INTO attachments (card_id, filename, original_name, file_size) VALUES ($1, $2, $3, $4)',
                    [result.rows[0].id, attachment.fileName, attachment.fileName, attachment.size || 0]
                );
            }
        }
        
        res.status(201).json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// Update a card
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (req.body.title) {
            fields.push(`title = $${paramCount++}`);
            values.push(req.body.title);
        }
        if (req.body.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(req.body.description);
        }
        if (req.body.listId) {
            fields.push(`list_id = $${paramCount++}`);
            values.push(req.body.listId);
        }
        if (req.body.position !== undefined) {
            fields.push(`position = $${paramCount++}`);
            values.push(req.body.position);
        }
        if (req.body.dueDate !== undefined) {
            fields.push(`due_date = $${paramCount++}`);
            values.push(req.body.dueDate);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.params.id);
        const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(toCamelCase(result.rows[0]));
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
});

// Delete a card
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

module.exports = router;