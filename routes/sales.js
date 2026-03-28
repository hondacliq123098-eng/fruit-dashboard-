const express = require('express');
const pool = require('../config/database');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.name as product_name, p.category 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      ORDER BY s.sale_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const result = await pool.query(`
      SELECT s.*, p.name as product_name, p.category 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      WHERE s.sale_date >= $1 AND s.sale_date <= $2 
      ORDER BY s.sale_date DESC
    `, [startDate, endDate]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity_kg, price_per_kg, sale_date } = req.body;
    if (!product_id || !quantity_kg || !price_per_kg || !sale_date) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const result = await pool.query(
      `INSERT INTO sales (product_id, quantity_kg, price_per_kg, sale_date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, quantity_kg, price_per_kg, sale_date]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
