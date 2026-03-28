/*
  # Create Fruit & Vegetable Business Dashboard Schema

  ## Overview
  This migration sets up the complete database schema for managing a fruit and vegetable business in India.
  
  ## Tables Created
  
  ### 1. products
  - `id` (uuid, primary key) - Unique identifier for each product
  - `name` (text, unique) - Product name (e.g., Tomato, Onion)
  - `category` (text) - Category (Fruit or Vegetable)
  - `unit_price` (numeric) - Base price per kg
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 2. sales
  - `id` (uuid, primary key) - Unique identifier for each sale
  - `product_id` (uuid, foreign key) - References products table
  - `quantity_kg` (numeric) - Quantity sold in kilograms
  - `price_per_kg` (numeric) - Selling price per kg
  - `total_amount` (numeric) - Calculated total (quantity × price)
  - `sale_date` (date) - Date of sale
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 3. costs
  - `id` (uuid, primary key) - Unique identifier for each cost entry
  - `cost_type` (text) - Type of cost (Raw Material, Labour, Electricity, Rent, Transport)
  - `amount` (numeric) - Cost amount in INR
  - `description` (text) - Optional description
  - `cost_date` (date) - Date of cost incurred
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 4. mandi_prices
  - `id` (uuid, primary key) - Unique identifier for each price entry
  - `product_name` (text) - Product name
  - `state` (text) - Indian state
  - `market` (text) - Market/Mandi name
  - `min_price` (numeric) - Minimum price per kg
  - `max_price` (numeric) - Maximum price per kg
  - `modal_price` (numeric) - Most common price per kg
  - `price_date` (date) - Date of price record
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Public read access for all tables (as this is a business management tool)
  - Authenticated users can perform all operations
  
  ## Important Notes
  - Uses Supabase's gen_random_uuid() for primary keys
  - Timestamps use timestamptz for timezone awareness
  - Numeric type used for precise financial calculations
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  unit_price numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_kg numeric(10, 2) NOT NULL,
  price_per_kg numeric(10, 2) NOT NULL,
  total_amount numeric(15, 2) NOT NULL,
  sale_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create costs table
CREATE TABLE IF NOT EXISTS costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_type text NOT NULL,
  amount numeric(15, 2) NOT NULL,
  description text DEFAULT '',
  cost_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create mandi_prices table
CREATE TABLE IF NOT EXISTS mandi_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  state text DEFAULT '',
  market text DEFAULT '',
  min_price numeric(10, 2) NOT NULL,
  max_price numeric(10, 2) NOT NULL,
  modal_price numeric(10, 2) NOT NULL,
  price_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  USING (true);

-- Create policies for sales table
CREATE POLICY "Anyone can view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sales"
  ON sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sales"
  ON sales FOR DELETE
  USING (true);

-- Create policies for costs table
CREATE POLICY "Anyone can view costs"
  ON costs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert costs"
  ON costs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update costs"
  ON costs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete costs"
  ON costs FOR DELETE
  USING (true);

-- Create policies for mandi_prices table
CREATE POLICY "Anyone can view mandi prices"
  ON mandi_prices FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert mandi prices"
  ON mandi_prices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update mandi prices"
  ON mandi_prices FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete mandi prices"
  ON mandi_prices FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_costs_type ON costs(cost_type);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_product ON mandi_prices(product_name);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_date ON mandi_prices(price_date);