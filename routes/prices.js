const express = require('express');
const pool = require('../config/database');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mandi_prices ORDER BY price_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/product/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const result = await pool.query(
      'SELECT * FROM mandi_prices WHERE product_name = $1 ORDER BY price_date DESC',
      [productName]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/latest', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (product_name) * FROM mandi_prices ORDER BY product_name, price_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { product_name, state, market, min_price, max_price, modal_price, price_date } = req.body;
    if (!product_name || !min_price || !max_price || !modal_price) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const result = await pool.query(
      `INSERT INTO mandi_prices (product_name, state, market, min_price, max_price, modal_price, price_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_name, state || '', market || '', min_price, max_price, modal_price, price_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
