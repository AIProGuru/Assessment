const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn()
  }
}));

const statsRouter = require('../stats');

const app = express();
app.use('/api/stats', statsRouter);

describe('Stats Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stats', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
      { id: 3, name: 'Ergonomic Chair', category: 'Furniture', price: 799 }
    ];

    it('should return calculated stats', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01') });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        total: 3,
        averagePrice: 1232.33,
        categories: {
          Electronics: 2,
          Furniture: 1
        },
        priceRange: {
          min: 399,
          max: 2499
        }
      });
    });

    it('should return cached stats on subsequent requests', async () => {
      const mockDate = new Date('2023-01-01');
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.stat.mockResolvedValue({ mtime: mockDate });

      // First request
      const response1 = await request(app)
        .get('/api/stats')
        .expect(200);

      // Second request with same file modification time
      const response2 = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response1.body).toEqual(response2.body);
      // readFile should only be called once due to caching
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should recalculate stats when file is modified', async () => {
      const mockDate1 = new Date('2023-01-01');
      const mockDate2 = new Date('2023-01-02');
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.stat
        .mockResolvedValueOnce({ mtime: mockDate1 })
        .mockResolvedValueOnce({ mtime: mockDate2 });

      // First request
      await request(app)
        .get('/api/stats')
        .expect(200);

      // Second request with different file modification time
      await request(app)
        .get('/api/stats')
        .expect(200);

      // readFile should be called twice due to cache invalidation
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should handle empty items array', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01') });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        total: 0,
        averagePrice: 0,
        categories: {},
        priceRange: {
          min: 0,
          max: 0
        }
      });
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      fs.stat.mockResolvedValue({ mtime: new Date('2023-01-01') });

      const response = await request(app)
        .get('/api/stats')
        .expect(500);

      expect(response.body.message).toBe('File not found');
    });

    it('should handle file stat errors', async () => {
      fs.stat.mockRejectedValue(new Error('Stat failed'));

      const response = await request(app)
        .get('/api/stats')
        .expect(500);

      expect(response.body.message).toBe('Stat failed');
    });
  });

  describe('DELETE /api/stats/cache', () => {
    it('should invalidate cache', async () => {
      const response = await request(app)
        .delete('/api/stats/cache')
        .expect(200);

      expect(response.body.message).toBe('Cache invalidated');
    });
  });
});
