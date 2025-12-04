const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/cards.json');

// Get all cards for a list
router.get('/list/:listId', (req, res) => {
    try {
        const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const listCards = cards.filter(card => card.listId === req.params.listId);
        res.json(listCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Get a specific card
router.get('/:id', (req, res) => {
    try {
        const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const card = cards.find(c => c.id === req.params.id);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

// Create a new card
router.post('/', (req, res) => {
    try {
        const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newCard = {
            id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description || '',
            listId: req.body.listId,
            position: req.body.position || cards.filter(c => c.listId === req.body.listId).length,
            dueDate: req.body.dueDate || null,
            attachments: req.body.attachments || [],
            createdAt: new Date().toISOString()
        };
        cards.push(newCard);
        fs.writeFileSync(dataPath, JSON.stringify(cards, null, 2));
        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// Update a card
router.put('/:id', (req, res) => {
    try {
        const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const cardIndex = cards.findIndex(c => c.id === req.params.id);
        if (cardIndex === -1) {
            return res.status(404).json({ error: 'Card not found' });
        }
        cards[cardIndex] = { ...cards[cardIndex], ...req.body };
        fs.writeFileSync(dataPath, JSON.stringify(cards, null, 2));
        res.json(cards[cardIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card' });
    }
});

// Delete a card
router.delete('/:id', (req, res) => {
    try {
        const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const filteredCards = cards.filter(c => c.id !== req.params.id);
        fs.writeFileSync(dataPath, JSON.stringify(filteredCards, null, 2));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

module.exports = router;