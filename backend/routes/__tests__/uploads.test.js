const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const uploadsRouter = require('../uploads');

// Create a test Express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use('/api/uploads', uploadsRouter);

// Mock fs module
jest.mock('fs');

describe('Uploads API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.statSync.mockReturnValue({ size: 1024 });
  });

  describe('POST /api/uploads/upload', () => {
    test('should upload a file successfully', async () => {
      const uploadData = {
        fileName: 'test.txt',
        fileData: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        cardId: 'card123'
      };

      const response = await request(app)
        .post('/api/uploads/upload')
        .send(uploadData)
        .expect(201);

      expect(response.body).toHaveProperty('fileName', 'test.txt');
      expect(response.body).toHaveProperty('storedName');
      expect(response.body).toHaveProperty('size');
      expect(response.body).toHaveProperty('uploadedAt');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/uploads/upload')
        .send({ fileName: 'test.txt' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    test('should sanitize file names', async () => {
      const uploadData = {
        fileName: 'test file@#$.txt',
        fileData: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        cardId: 'card123'
      };

      const response = await request(app)
        .post('/api/uploads/upload')
        .send(uploadData)
        .expect(201);

      // $ gets replaced with _, special characters sanitized
      expect(response.body.storedName).toMatch(/card123_\d+_test_file___.txt/);
    });

    test('should handle upload errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      const uploadData = {
        fileName: 'test.txt',
        fileData: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        cardId: 'card123'
      };

      const response = await request(app)
        .post('/api/uploads/upload')
        .send(uploadData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to upload file');
    });
  });

  describe('GET /api/uploads/download/:fileName', () => {
    test('should return 404 for non-existent file', async () => {
      fs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get('/api/uploads/download/nonexistent.txt')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'File not found');
    });
  });

  describe('DELETE /api/uploads/:fileName', () => {
    test('should delete an existing file', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => {});

      const response = await request(app)
        .delete('/api/uploads/test.txt')
        .expect(204);

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    test('should return 204 even if file does not exist (idempotent)', async () => {
      fs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .delete('/api/uploads/nonexistent.txt')
        .expect(204);
    });

    test('should handle deletion errors', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Delete error');
      });

      const response = await request(app)
        .delete('/api/uploads/test.txt')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to delete file');
    });
  });

  describe('File Security', () => {
    test('should generate unique file names', async () => {
      const uploadData = {
        fileName: 'test.txt',
        fileData: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        cardId: 'card123'
      };

      const response1 = await request(app)
        .post('/api/uploads/upload')
        .send(uploadData);

      // Wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const response2 = await request(app)
        .post('/api/uploads/upload')
        .send(uploadData);

      expect(response1.body.storedName).not.toBe(response2.body.storedName);
    });
  });
});
