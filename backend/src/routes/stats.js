const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let statsCache = null;
let lastModified = null;

// Function to calculate stats
function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.length > 0 ? Math.round((items.reduce((acc, cur) => acc + cur.price, 0) / items.length) * 100) / 100 : 0,
    categories: items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
    priceRange: items.length > 0 ? {
      min: Math.min(...items.map(item => item.price)),
      max: Math.max(...items.map(item => item.price))
    } : { min: 0, max: 0 }
  };
}

// Function to get file stats
async function getFileStats() {
  try {
    const stats = await fs.stat(DATA_PATH);
    return stats.mtime;
  } catch (error) {
    return null;
  }
}

// Function to invalidate cache
function invalidateCache() {
  statsCache = null;
  lastModified = null;
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const currentModified = await getFileStats();
    
    // Check if cache is still valid
    if (statsCache && lastModified && currentModified <= lastModified) {
      return res.json(statsCache);
    }
    
    // Read and calculate stats
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    // Calculate stats
    statsCache = calculateStats(items);
    lastModified = currentModified;
    
    res.json(statsCache);
  } catch (err) {
    console.error('Stats error:', err);
    next(err);
  }
});

// Endpoint to manually invalidate cache (useful for testing)
router.delete('/cache', (req, res) => {
  invalidateCache();
  res.json({ message: 'Cache invalidated' });
});

module.exports = router;