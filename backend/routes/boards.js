const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/boards.json');

// Get all boards
router.get('/', (req, res) => {
    try {
        const boards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

// Get a specific board
router.get('/:id', (req, res) => {
    try {
        const boards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const board = boards.find(b => b.id === req.params.id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch board' });
    }
});

// Create a new board
router.post('/', (req, res) => {
    try {
        const boards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newBoard = {
            id: Date.now().toString(),
            name: req.body.name,
            description: req.body.description || '',
            createdAt: new Date().toISOString()
        };
        boards.push(newBoard);
        fs.writeFileSync(dataPath, JSON.stringify(boards, null, 2));
        res.status(201).json(newBoard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create board' });
    }
});

// Update a board
router.put('/:id', (req, res) => {
    try {
        const boards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const boardIndex = boards.findIndex(b => b.id === req.params.id);
        if (boardIndex === -1) {
            return res.status(404).json({ error: 'Board not found' });
        }
        boards[boardIndex] = { ...boards[boardIndex], ...req.body };
        fs.writeFileSync(dataPath, JSON.stringify(boards, null, 2));
        res.json(boards[boardIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update board' });
    }
});

// Delete a board
router.delete('/:id', (req, res) => {
    try {
        const boards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const filteredBoards = boards.filter(b => b.id !== req.params.id);
        fs.writeFileSync(dataPath, JSON.stringify(filteredBoards, null, 2));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

module.exports = router;