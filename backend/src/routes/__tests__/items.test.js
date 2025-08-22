const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn()
  }
}));

const itemsRouter = require('../items');

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('Items Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
      { id: 3, name: 'Ergonomic Chair', category: 'Furniture', price: 799 }
    ];

    it('should return all items when no query parameters', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.items).toEqual(mockItems);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should filter items by search query', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items?q=electronics')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].name).toBe('Laptop Pro');
      expect(response.body.items[1].name).toBe('Noise Cancelling Headphones');
    });

    it('should paginate results', async () => {
      const largeMockItems = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: 'Test',
        price: 100
      }));
      
      fs.readFile.mockResolvedValue(JSON.stringify(largeMockItems));

      const response = await request(app)
        .get('/api/items?page=2&limit=10')
        .expect(200);

      expect(response.body.items).toHaveLength(10);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items')
        .expect(500);

      expect(response.body.message).toContain('Failed to read data');
    });
  });

  describe('GET /api/items/:id', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 }
    ];

    it('should return item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toEqual(mockItems[0]);
    });

    it('should return 404 for non-existent item', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body.message).toBe('Item not found');
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/items/1')
        .expect(500);

      expect(response.body.message).toContain('Failed to read data');
    });
  });

  describe('POST /api/items', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }
    ];

    it('should create new item with valid data', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const newItem = {
        name: 'New Item',
        category: 'Test',
        price: 100
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toMatchObject(newItem);
      expect(response.body.id).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return 400 for invalid item data', async () => {
      const invalidItem = {
        name: 'Test Item'
        // Missing category and price
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.message).toContain('Invalid item data');
    });

    it('should return 400 for non-numeric price', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Test',
        price: 'not a number'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.message).toContain('Invalid item data');
    });

    it('should handle file write errors', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      const newItem = {
        name: 'New Item',
        category: 'Test',
        price: 100
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(500);

      expect(response.body.message).toContain('Failed to write data');
    });
  });
});
