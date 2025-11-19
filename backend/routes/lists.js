const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/lists.json');

// Get all lists for a board
router.get('/board/:boardId', (req, res) => {
    try {
        const lists = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const boardLists = lists.filter(list => list.boardId === req.params.boardId);
        res.json(boardLists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
});

// Get a specific list
router.get('/:id', (req, res) => {
    try {
        const lists = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const list = lists.find(l => l.id === req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch list' });
    }
});

// Create a new list
router.post('/', (req, res) => {
    try {
        const lists = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newList = {
            id: Date.now().toString(),
            name: req.body.name,
            boardId: req.body.boardId,
            position: req.body.position || lists.filter(l => l.boardId === req.body.boardId).length,
            createdAt: new Date().toISOString()
        };
        lists.push(newList);
        fs.writeFileSync(dataPath, JSON.stringify(lists, null, 2));
        res.status(201).json(newList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// Update a list
router.put('/:id', (req, res) => {
    try {
        const lists = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const listIndex = lists.findIndex(l => l.id === req.params.id);
        if (listIndex === -1) {
            return res.status(404).json({ error: 'List not found' });
        }
        lists[listIndex] = { ...lists[listIndex], ...req.body };
        fs.writeFileSync(dataPath, JSON.stringify(lists, null, 2));
        res.json(lists[listIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update list' });
    }
});

// Delete a list
router.delete('/:id', (req, res) => {
    try {
        const lists = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const filteredLists = lists.filter(l => l.id !== req.params.id);
        fs.writeFileSync(dataPath, JSON.stringify(filteredLists, null, 2));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

module.exports = router;