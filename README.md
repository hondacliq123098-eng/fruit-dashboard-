# FreshBiz Manager - Fruit & Vegetable Business Dashboard

A comprehensive web application for managing a fruit and vegetable business in India. Track sales, costs, profit metrics, and monitor mandi prices all in one place.

## Features

- Home Dashboard with key business metrics
- Profit Analytics with detailed financial calculations
- Sales Management for recording transactions
- Cost Tracking across multiple categories
- Mandi Prices from major markets across India
- Interactive charts and visual data representation

## Tech Stack

- Frontend: React 18 with Vite
- Database: Supabase PostgreSQL
- Charts: Recharts
- Icons: Lucide React
- Routing: React Router v6

## Quick Start

1. Install dependencies:

```bash
cd client
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

3. Build for production:

```bash
npm run build
```

## Database Schema

The application uses Supabase with four main tables:

- products: Product information and pricing
- sales: Sales transactions with quantities and amounts
- costs: Business expenses by category
- mandi_prices: Market prices from various mandis

## Profit Calculation

Gross Profit = Revenue - (Raw Material + Transport)
EBITDA = Gross Profit - (Labour + Electricity)
PBT = EBITDA - Rent - Depreciation
PAT = PBT - Tax

## License

MIT
