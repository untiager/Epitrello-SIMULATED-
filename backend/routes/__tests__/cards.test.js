const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cardsRouter = require('../cards');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/cards', cardsRouter);

// Mock data paths
const testDataPath = path.join(__dirname, '../data/cards.json');

// Mock data
const mockCards = [
  {
    id: '1',
    title: 'Test Card 1',
    description: 'Description 1',
    listId: 'list1',
    position: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Test Card 2',
    description: 'Description 2',
    listId: 'list1',
    position: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Test Card 3',
    description: 'Description 3',
    listId: 'list2',
    position: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

// Mock fs module
jest.mock('fs');

describe('Cards API Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementation
    fs.readFileSync.mockReturnValue(JSON.stringify(mockCards));
    fs.writeFileSync.mockImplementation(() => {});
  });

  describe('GET /api/cards/list/:listId', () => {
    test('should return all cards for a specific list', async () => {
      const response = await request(app)
        .get('/api/cards/list/list1')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].listId).toBe('list1');
      expect(response.body[1].listId).toBe('list1');
    });

    test('should return empty array for list with no cards', async () => {
      const response = await request(app)
        .get('/api/cards/list/nonexistent')
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });

    test('should handle file read errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const response = await request(app)
        .get('/api/cards/list/list1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch cards');
    });
  });

  describe('GET /api/cards/:id', () => {
    test('should return a specific card by id', async () => {
      const response = await request(app)
        .get('/api/cards/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Test Card 1');
    });

    test('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .get('/api/cards/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Card not found');
    });

    test('should handle file read errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const response = await request(app)
        .get('/api/cards/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch card');
    });
  });

  describe('POST /api/cards', () => {
    test('should create a new card successfully', async () => {
      const newCard = {
        title: 'New Test Card',
        description: 'New Description',
        listId: 'list1',
        dueDate: '2024-12-31',
        attachments: []
      };

      const response = await request(app)
        .post('/api/cards')
        .send(newCard)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Test Card');
      expect(response.body).toHaveProperty('description', 'New Description');
      expect(response.body).toHaveProperty('listId', 'list1');
      expect(response.body).toHaveProperty('dueDate', '2024-12-31');
      expect(response.body).toHaveProperty('attachments');
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('createdAt');
      
      // Verify writeFileSync was called
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should create card with default values when optional fields are missing', async () => {
      const newCard = {
        title: 'Minimal Card',
        listId: 'list1'
      };

      const response = await request(app)
        .post('/api/cards')
        .send(newCard)
        .expect(201);

      expect(response.body).toHaveProperty('description', '');
      expect(response.body).toHaveProperty('dueDate', null);
      expect(response.body).toHaveProperty('attachments');
      expect(response.body.attachments).toEqual([]);
      expect(response.body).toHaveProperty('position');
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const newCard = {
        title: 'Test Card',
        listId: 'list1'
      };

      const response = await request(app)
        .post('/api/cards')
        .send(newCard)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create card');
    });
  });

  describe('PUT /api/cards/:id', () => {
    test('should update an existing card', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put('/api/cards/1')
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('description', 'Updated Description');
      
      // Verify writeFileSync was called
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should return 404 for non-existent card', async () => {
      const updates = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/cards/999')
        .send(updates)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Card not found');
    });

    test('should partially update card (keep existing fields)', async () => {
      const updates = {
        title: 'Only Title Updated'
      };

      const response = await request(app)
        .put('/api/cards/1')
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Only Title Updated');
      expect(response.body).toHaveProperty('listId', 'list1'); // Original value preserved
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const updates = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/cards/1')
        .send(updates)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to update card');
    });
  });

  describe('DELETE /api/cards/:id', () => {
    test('should delete an existing card', async () => {
      const response = await request(app)
        .delete('/api/cards/1')
        .expect(204);

      expect(response.body).toEqual({});
      
      // Verify writeFileSync was called with filtered cards
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(writtenData).not.toContainEqual(expect.objectContaining({ id: '1' }));
    });

    test('should return 204 even for non-existent card (idempotent)', async () => {
      const response = await request(app)
        .delete('/api/cards/999')
        .expect(204);

      expect(response.body).toEqual({});
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const response = await request(app)
        .delete('/api/cards/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to delete card');
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('should handle empty cards file', async () => {
      fs.readFileSync.mockReturnValue(JSON.stringify([]));

      const response = await request(app)
        .get('/api/cards/list/list1')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should handle malformed JSON', async () => {
      fs.readFileSync.mockReturnValue('invalid json');

      const response = await request(app)
        .get('/api/cards/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should create card with position based on existing cards in list', async () => {
      const newCard = {
        title: 'New Card in list1',
        listId: 'list1'
      };

      const response = await request(app)
        .post('/api/cards')
        .send(newCard)
        .expect(201);

      // list1 already has 2 cards (positions 0 and 1), so new card should be at position 2
      expect(response.body.position).toBe(2);
    });
  });
});
