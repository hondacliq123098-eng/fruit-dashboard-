const express = require('express');
const pool = require('../config/database');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { name, category, unit_price } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Name and category are required' });
    }
    const result = await pool.query(
      'INSERT INTO products (name, category, unit_price) VALUES ($1, $2, $3) RETURNING *',
      [name, category, unit_price || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
