# Fruit & Vegetable Business Dashboard - Backend

A comprehensive backend system for managing a fruit and vegetable business in India.

## 🚀 Quick Start

npm install
npm run db:setup
npm start

Server runs at: http://localhost:5000

## 📊 API Endpoints

- GET /health
- GET /api/products
- GET /api/sales
- GET /api/costs
- GET /api/profit/metrics/:startDate/:endDate
- GET /api/prices/latest

## 💰 Profit Calculation

Gross Profit = Revenue - (Raw Material + Transport)
EBITDA = Gross Profit - (Labour + Electricity)
PBT = EBITDA - Rent - Depreciation
PAT = PBT - Tax
