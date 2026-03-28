const express = require('express');
const pool = require('../config/database');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM costs ORDER BY cost_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const result = await pool.query(
      'SELECT * FROM costs WHERE cost_date >= $1 AND cost_date <= $2 ORDER BY cost_date DESC',
      [startDate, endDate]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/type/:costType', async (req, res) => {
  try {
    const { costType } = req.params;
    const result = await pool.query(
      'SELECT * FROM costs WHERE cost_type = $1 ORDER BY cost_date DESC',
      [costType]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { cost_type, amount, description, cost_date } = req.body;
    if (!cost_type || !amount || !cost_date) {
      return res.status(400).json({ success: false, error: 'cost_type, amount, and cost_date are required' });
    }
    const result = await pool.query(
      'INSERT INTO costs (cost_type, amount, description, cost_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [cost_type, amount, description || '', cost_date]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
