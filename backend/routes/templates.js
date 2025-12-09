const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get all board templates
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM board_templates WHERE is_public = true ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get a specific template
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM board_templates WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Create a new template from a board
router.post('/', async (req, res) => {
    try {
        const { name, description, boardId, isPublic } = req.body;
        
        // Get board data with lists and cards
        const boardResult = await pool.query('SELECT * FROM boards WHERE id = $1', [boardId]);
        if (boardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }
        
        const listsResult = await pool.query(
            'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
            [boardId]
        );
        
        const cardsResult = await pool.query(
            `SELECT c.* FROM cards c 
             JOIN lists l ON c.list_id = l.id 
             WHERE l.board_id = $1 
             ORDER BY c.position`,
            [boardId]
        );
        
        // Build template data
        const templateData = {
            board: boardResult.rows[0],
            lists: listsResult.rows,
            cards: cardsResult.rows
        };
        
        const result = await pool.query(
            'INSERT INTO board_templates (name, description, template_data, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description || '', JSON.stringify(templateData), isPublic !== false]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Create a board from a template
router.post('/:id/create-board', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { name, userId } = req.body;
        
        // Get template
        const templateResult = await client.query(
            'SELECT * FROM board_templates WHERE id = $1',
            [req.params.id]
        );
        
        if (templateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Template not found' });
        }
        
        const template = templateResult.rows[0];
        const templateData = template.template_data;
        
        // Create new board
        const boardResult = await client.query(
            'INSERT INTO boards (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
            [name || template.name, templateData.board.description || '', userId || null]
        );
        
        const newBoardId = boardResult.rows[0].id;
        
        // Create lists from template
        const listIdMap = {};
        for (const list of templateData.lists) {
            const listResult = await client.query(
                'INSERT INTO lists (title, board_id, position) VALUES ($1, $2, $3) RETURNING *',
                [list.title, newBoardId, list.position]
            );
            listIdMap[list.id] = listResult.rows[0].id;
        }
        
        // Create cards from template
        for (const card of templateData.cards) {
            await client.query(
                'INSERT INTO cards (title, description, list_id, position) VALUES ($1, $2, $3, $4)',
                [card.title, card.description || '', listIdMap[card.list_id], card.position]
            );
        }
        
        await client.query('COMMIT');
        res.status(201).json(boardResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating board from template:', error);
        res.status(500).json({ error: 'Failed to create board from template' });
    } finally {
        client.release();
    }
});

// Delete a template
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM board_templates WHERE id = $1 RETURNING id',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

module.exports = router;
