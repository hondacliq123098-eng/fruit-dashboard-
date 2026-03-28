const pool = require('../config/database');
const initDb = async () => {
  try {
    console.log('🔄 Creating database tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        unit_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Products table created');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity_kg DECIMAL(10, 2) NOT NULL,
        price_per_kg DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_kg * price_per_kg) STORED,
        sale_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Sales table created');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS costs (
        id SERIAL PRIMARY KEY,
        cost_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        cost_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Costs table created');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mandi_prices (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        state VARCHAR(50),
        market VARCHAR(100),
        min_price DECIMAL(10, 2),
        max_price DECIMAL(10, 2),
        modal_price DECIMAL(10, 2),
        price_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Mandi Prices table created');
    console.log('✅ All tables created successfully!');
    pool.end();
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    pool.end();
    process.exit(1);
  }
};
initDb();
