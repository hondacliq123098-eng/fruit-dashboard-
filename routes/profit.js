const express = require('express');
const pool = require('../config/database');
const router = express.Router();
router.get('/metrics/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const revenueResult = await pool.query(`
      SELECT SUM(total_amount) as total_revenue, SUM(quantity_kg) as total_qty
      FROM sales WHERE sale_date >= $1 AND sale_date <= $2
    `, [startDate, endDate]);
    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue) || 0;
    const totalQuantity = parseFloat(revenueResult.rows[0].total_qty) || 0;
    const costsResult = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN cost_type = 'Raw Material' THEN amount END), 0) as raw_material,
        COALESCE(SUM(CASE WHEN cost_type = 'Labour' THEN amount END), 0) as labour,
        COALESCE(SUM(CASE WHEN cost_type = 'Electricity' THEN amount END), 0) as electricity,
        COALESCE(SUM(CASE WHEN cost_type = 'Rent' THEN amount END), 0) as rent,
        COALESCE(SUM(CASE WHEN cost_type = 'Transport' THEN amount END), 0) as transport,
        COALESCE(SUM(amount), 0) as total_costs
      FROM costs WHERE cost_date >= $1 AND cost_date <= $2
    `, [startDate, endDate]);
    const costs = costsResult.rows[0];
    const rawMaterial = parseFloat(costs.raw_material);
    const labour = parseFloat(costs.labour);
    const electricity = parseFloat(costs.electricity);
    const rent = parseFloat(costs.rent);
    const transport = parseFloat(costs.transport);
    const totalCosts = parseFloat(costs.total_costs);
    const grossProfit = totalRevenue - (rawMaterial + transport);
    const ebitda = grossProfit - (labour + electricity);
    const depreciation = ebitda * 0.05;
    const pbt = ebitda - rent - depreciation;
    const tax = pbt > 0 ? pbt * 0.30 : 0;
    const pat = pbt - tax;
    const profitPerKg = totalQuantity > 0 ? (pat / totalQuantity).toFixed(2) : 0;
    const costPerKg = totalQuantity > 0 ? (totalCosts / totalQuantity).toFixed(2) : 0;
    const marginPercentage = totalRevenue > 0 ? ((pat / totalRevenue) * 100).toFixed(2) : 0;
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        revenue: { totalRevenue: totalRevenue.toFixed(2) },
        costs: {
          rawMaterial: rawMaterial.toFixed(2),
          labour: labour.toFixed(2),
          electricity: electricity.toFixed(2),
          rent: rent.toFixed(2),
          transport: transport.toFixed(2),
          totalCosts: totalCosts.toFixed(2),
        },
        profitMetrics: {
          grossProfit: grossProfit.toFixed(2),
          ebitda: ebitda.toFixed(2),
          depreciation: depreciation.toFixed(2),
          pbt: pbt.toFixed(2),
          tax: tax.toFixed(2),
          pat: pat.toFixed(2),
        },
        efficiency: {
          totalQuantitySold: totalQuantity.toFixed(2),
          profitPerKg,
          costPerKg,
          marginPercentage: `${marginPercentage}%`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const revenueResult = await pool.query(
      'SELECT SUM(total_amount) as total FROM sales WHERE sale_date = $1',
      [date]
    );
    const costsResult = await pool.query(
      'SELECT SUM(amount) as total FROM costs WHERE cost_date = $1',
      [date]
    );
    const revenue = parseFloat(revenueResult.rows[0].total) || 0;
    const costs = parseFloat(costsResult.rows[0].total) || 0;
    const profit = revenue - costs;
    res.json({
      success: true,
      data: {
        date,
        revenue: revenue.toFixed(2),
        costs: costs.toFixed(2),
        netProfit: profit.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
