const express = require('express');
const cors = require('cors');
require('dotenv').config();
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const costsRoutes = require('./routes/costs');
const profitRoutes = require('./routes/profit');
const priceRoutes = require('./routes/prices');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/costs', costsRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/prices', priceRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Base: http://localhost:${PORT}/api`);
});
