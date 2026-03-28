import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TrendingUp, DollarSign, Package, ChartBar as BarChart3, ArrowRight } from 'lucide-react';
import './HomePage.css';

function HomePage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCosts: 0,
    totalProducts: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [salesRes, costsRes, productsRes] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount')
          .gte('sale_date', sevenDaysAgo)
          .lte('sale_date', today),
        supabase
          .from('costs')
          .select('amount')
          .gte('cost_date', sevenDaysAgo)
          .lte('cost_date', today),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);

      const totalSales = salesRes.data?.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) || 0;
      const totalCosts = costsRes.data?.reduce((sum, cost) => sum + parseFloat(cost.amount), 0) || 0;
      const totalProducts = productsRes.count || 0;
      const netProfit = totalSales - totalCosts;

      setStats({
        totalSales,
        totalCosts,
        totalProducts,
        netProfit,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Fruit & Vegetable Business Manager</h1>
          <p className="hero-subtitle">
            Comprehensive dashboard for managing your fresh produce business in India
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">
              View Dashboard
              <ArrowRight size={20} />
            </Link>
            <Link to="/sales" className="btn btn-secondary">
              Manage Sales
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h2 className="section-title">Last 7 Days Performance</h2>
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon">
                <TrendingUp size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-label">Total Sales</h3>
                <p className="stat-value">{formatCurrency(stats.totalSales)}</p>
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon">
                <DollarSign size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-label">Total Costs</h3>
                <p className="stat-value">{formatCurrency(stats.totalCosts)}</p>
              </div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon">
                <Package size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-label">Products</h3>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
            </div>

            <div className={`stat-card ${stats.netProfit >= 0 ? 'green' : 'red'}`}>
              <div className="stat-icon">
                <BarChart3 size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-label">Net Profit</h3>
                <p className="stat-value">{formatCurrency(stats.netProfit)}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="features-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <BarChart3 size={40} className="feature-icon" />
            <h3>Profit Analytics</h3>
            <p>Track EBITDA, PBT, PAT and other key financial metrics</p>
          </div>
          <div className="feature-card">
            <TrendingUp size={40} className="feature-icon" />
            <h3>Sales Management</h3>
            <p>Record and monitor daily sales across all products</p>
          </div>
          <div className="feature-card">
            <DollarSign size={40} className="feature-icon" />
            <h3>Cost Tracking</h3>
            <p>Manage expenses including raw materials, labour, and transport</p>
          </div>
          <div className="feature-card">
            <Package size={40} className="feature-icon" />
            <h3>Mandi Prices</h3>
            <p>View current market prices from major mandis across India</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
