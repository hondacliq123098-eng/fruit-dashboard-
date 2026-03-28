const pool = require('../config/database');
const seedData = async () => {
  try {
    console.log('🌱 Seeding dummy data...');
    const products = [
      { name: 'Tomato', category: 'Vegetable' },
      { name: 'Onion', category: 'Vegetable' },
      { name: 'Potato', category: 'Vegetable' },
      { name: 'Carrot', category: 'Vegetable' },
      { name: 'Brinjal', category: 'Vegetable' },
      { name: 'Banana', category: 'Fruit' },
      { name: 'Apple', category: 'Fruit' },
      { name: 'Mango', category: 'Fruit' },
    ];
    for (const product of products) {
      await pool.query(
        'INSERT INTO products (name, category, unit_price) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [product.name, product.category, Math.floor(Math.random() * 100) + 20]
      );
    }
    console.log('✅ Products added');
    const startDate = new Date('2026-02-27');
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      for (let j = 1; j <= 4; j++) {
        const quantity = (Math.random() * 100 + 20).toFixed(2);
        const pricePerKg = (Math.random() * 50 + 20).toFixed(2);
        await pool.query(
          'INSERT INTO sales (product_id, quantity_kg, price_per_kg, sale_date) VALUES ($1, $2, $3, $4)',
          [j, quantity, pricePerKg, dateStr]
        );
      }
    }
    console.log('✅ Sales data added');
    const costTypes = ['Raw Material', 'Labour', 'Electricity', 'Rent', 'Transport'];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      for (const costType of costTypes) {
        const amount = Math.floor(Math.random() * 5000) + 1000;
        await pool.query(
          'INSERT INTO costs (cost_type, amount, description, cost_date) VALUES ($1, $2, $3, $4)',
          [costType, amount, `${costType} for ${dateStr}`, dateStr]
        );
      }
    }
    console.log('✅ Costs data added');
    const mandiPrices = [
      { product: 'Tomato', state: 'Maharashtra', market: 'Mumbai', min: 20, max: 40, modal: 30 },
      { product: 'Onion', state: 'Rajasthan', market: 'Jaipur', min: 18, max: 35, modal: 25 },
      { product: 'Potato', state: 'Punjab', market: 'Ludhiana', min: 15, max: 30, modal: 22 },
      { product: 'Banana', state: 'Gujarat', market: 'Ahmedabad', min: 30, max: 60, modal: 45 },
    ];
    for (const price of mandiPrices) {
      await pool.query(
        'INSERT INTO mandi_prices (product_name, state, market, min_price, max_price, modal_price, price_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [price.product, price.state, price.market, price.min, price.max, price.modal, '2026-03-28']
      );
    }
    console.log('✅ Mandi prices added');
    console.log('✅ Dummy data seeded successfully!');
    pool.end();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    pool.end();
    process.exit(1);
  }
};
seedData();
