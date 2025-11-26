const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const listsRouter = require('../lists');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/lists', listsRouter);

// Mock data paths
const testDataPath = path.join(__dirname, '../data/lists.json');

// Mock data
const mockLists = [
  {
    id: '1',
    name: 'To Do',
    boardId: 'board1',
    position: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'In Progress',
    boardId: 'board1',
    position: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Done',
    boardId: 'board2',
    position: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

// Mock fs module
jest.mock('fs');

describe('Lists API Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementation
    fs.readFileSync.mockReturnValue(JSON.stringify(mockLists));
    fs.writeFileSync.mockImplementation(() => {});
  });

  describe('GET /api/lists/board/:boardId', () => {
    test('should return all lists for a specific board', async () => {
      const response = await request(app)
        .get('/api/lists/board/board1')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].boardId).toBe('board1');
      expect(response.body[1].boardId).toBe('board1');
      expect(response.body[0].name).toBe('To Do');
      expect(response.body[1].name).toBe('In Progress');
    });

    test('should return empty array for board with no lists', async () => {
      const response = await request(app)
        .get('/api/lists/board/nonexistent')
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });

    test('should handle file read errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const response = await request(app)
        .get('/api/lists/board/board1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch lists');
    });
  });

  describe('GET /api/lists/:id', () => {
    test('should return a specific list by id', async () => {
      const response = await request(app)
        .get('/api/lists/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'To Do');
      expect(response.body).toHaveProperty('boardId', 'board1');
    });

    test('should return 404 for non-existent list', async () => {
      const response = await request(app)
        .get('/api/lists/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'List not found');
    });

    test('should handle file read errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const response = await request(app)
        .get('/api/lists/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch list');
    });
  });

  describe('POST /api/lists', () => {
    test('should create a new list successfully', async () => {
      const newList = {
        name: 'New List',
        boardId: 'board1'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New List');
      expect(response.body).toHaveProperty('boardId', 'board1');
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('createdAt');
      
      // Verify writeFileSync was called
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should create list with correct position based on existing lists', async () => {
      const newList = {
        name: 'Third List',
        boardId: 'board1'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      // board1 already has 2 lists (positions 0 and 1), so new list should be at position 2
      expect(response.body.position).toBe(2);
    });

    test('should allow custom position when provided', async () => {
      const newList = {
        name: 'Custom Position List',
        boardId: 'board1',
        position: 5
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      expect(response.body.position).toBe(5);
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const newList = {
        name: 'Test List',
        boardId: 'board1'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create list');
    });
  });

  describe('PUT /api/lists/:id', () => {
    test('should update an existing list', async () => {
      const updates = {
        name: 'Updated List Name',
        position: 5
      };

      const response = await request(app)
        .put('/api/lists/1')
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated List Name');
      expect(response.body).toHaveProperty('position', 5);
      
      // Verify writeFileSync was called
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should return 404 for non-existent list', async () => {
      const updates = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/lists/999')
        .send(updates)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'List not found');
    });

    test('should partially update list (keep existing fields)', async () => {
      const updates = {
        name: 'Only Name Updated'
      };

      const response = await request(app)
        .put('/api/lists/1')
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Only Name Updated');
      expect(response.body).toHaveProperty('boardId', 'board1'); // Original value preserved
      expect(response.body).toHaveProperty('position', 0); // Original value preserved
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const updates = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/lists/1')
        .send(updates)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to update list');
    });
  });

  describe('DELETE /api/lists/:id', () => {
    test('should delete an existing list', async () => {
      const response = await request(app)
        .delete('/api/lists/1')
        .expect(204);

      expect(response.body).toEqual({});
      
      // Verify writeFileSync was called with filtered lists
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(writtenData).not.toContainEqual(expect.objectContaining({ id: '1' }));
      expect(writtenData).toHaveLength(2); // Should have 2 remaining lists
    });

    test('should return 204 even for non-existent list (idempotent)', async () => {
      const response = await request(app)
        .delete('/api/lists/999')
        .expect(204);

      expect(response.body).toEqual({});
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const response = await request(app)
        .delete('/api/lists/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to delete list');
    });

    test('should successfully delete multiple lists sequentially', async () => {
      // Delete first list
      await request(app)
        .delete('/api/lists/1')
        .expect(204);

      // Update mock to reflect first deletion
      const updatedLists = mockLists.filter(l => l.id !== '1');
      fs.readFileSync.mockReturnValue(JSON.stringify(updatedLists));

      // Delete second list
      await request(app)
        .delete('/api/lists/2')
        .expect(204);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('should handle empty lists file', async () => {
      fs.readFileSync.mockReturnValue(JSON.stringify([]));

      const response = await request(app)
        .get('/api/lists/board/board1')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should handle malformed JSON', async () => {
      fs.readFileSync.mockReturnValue('invalid json');

      const response = await request(app)
        .get('/api/lists/1')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle very long list names', async () => {
      const longName = 'A'.repeat(1000);
      const newList = {
        name: longName,
        boardId: 'board1'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      expect(response.body.name).toBe(longName);
    });

    test('should handle special characters in list names', async () => {
      const specialName = 'List with émojis 🎉 & spëcial çharacters!';
      const newList = {
        name: specialName,
        boardId: 'board1'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      expect(response.body.name).toBe(specialName);
    });

    test('should correctly count lists for position when multiple boards exist', async () => {
      const newList = {
        name: 'New List for Board 2',
        boardId: 'board2'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(newList)
        .expect(201);

      // board2 has 1 list (position 0), so new list should be at position 1
      expect(response.body.position).toBe(1);
    });
  });

  describe('Integration Scenarios', () => {
    test('should maintain list order after updates', async () => {
      // Swap positions of two lists
      await request(app)
        .put('/api/lists/1')
        .send({ position: 1 })
        .expect(200);

      await request(app)
        .put('/api/lists/2')
        .send({ position: 0 })
        .expect(200);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    test('should handle rapid create operations', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/lists')
            .send({ name: `List ${i}`, boardId: 'board1' })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });
});
