import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import './DashboardPage.css';

function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, costsRes] = await Promise.all([
        supabase
          .from('sales')
          .select('*')
          .gte('sale_date', dateRange.startDate)
          .lte('sale_date', dateRange.endDate)
          .order('sale_date'),
        supabase
          .from('costs')
          .select('*')
          .gte('cost_date', dateRange.startDate)
          .lte('cost_date', dateRange.endDate)
          .order('cost_date'),
      ]);

      calculateMetrics(salesRes.data, costsRes.data);
      prepareChartData(salesRes.data, costsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (sales, costs) => {
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + parseFloat(sale.quantity_kg), 0);

    const costBreakdown = {
      rawMaterial: 0,
      labour: 0,
      electricity: 0,
      rent: 0,
      transport: 0,
    };

    costs.forEach((cost) => {
      const amount = parseFloat(cost.amount);
      if (cost.cost_type === 'Raw Material') costBreakdown.rawMaterial += amount;
      else if (cost.cost_type === 'Labour') costBreakdown.labour += amount;
      else if (cost.cost_type === 'Electricity') costBreakdown.electricity += amount;
      else if (cost.cost_type === 'Rent') costBreakdown.rent += amount;
      else if (cost.cost_type === 'Transport') costBreakdown.transport += amount;
    });

    const totalCosts =
      costBreakdown.rawMaterial +
      costBreakdown.labour +
      costBreakdown.electricity +
      costBreakdown.rent +
      costBreakdown.transport;

    const grossProfit = totalRevenue - (costBreakdown.rawMaterial + costBreakdown.transport);
    const ebitda = grossProfit - (costBreakdown.labour + costBreakdown.electricity);
    const depreciation = ebitda * 0.05;
    const pbt = ebitda - costBreakdown.rent - depreciation;
    const tax = pbt > 0 ? pbt * 0.3 : 0;
    const pat = pbt - tax;

    setMetrics({
      totalRevenue,
      totalQuantity,
      costBreakdown,
      totalCosts,
      grossProfit,
      ebitda,
      depreciation,
      pbt,
      tax,
      pat,
      profitPerKg: totalQuantity > 0 ? pat / totalQuantity : 0,
      marginPercentage: totalRevenue > 0 ? (pat / totalRevenue) * 100 : 0,
    });
  };

  const prepareChartData = (sales, costs) => {
    const dateMap = new Map();

    sales.forEach((sale) => {
      const date = sale.sale_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, sales: 0, costs: 0 });
      }
      dateMap.get(date).sales += parseFloat(sale.total_amount);
    });

    costs.forEach((cost) => {
      const date = cost.cost_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, sales: 0, costs: 0 });
      }
      dateMap.get(date).costs += parseFloat(cost.amount);
    });

    const data = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        ...item,
        profit: item.sales - item.costs,
      }));

    setChartData(data);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Business Dashboard</h1>
        <div className="date-filter">
          <Calendar size={20} />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : metrics ? (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Revenue</h3>
              <p className="metric-value green">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <div className="metric-card">
              <h3>Total Costs</h3>
              <p className="metric-value red">{formatCurrency(metrics.totalCosts)}</p>
            </div>
            <div className="metric-card">
              <h3>Gross Profit</h3>
              <p className="metric-value">{formatCurrency(metrics.grossProfit)}</p>
            </div>
            <div className="metric-card">
              <h3>EBITDA</h3>
              <p className="metric-value">{formatCurrency(metrics.ebitda)}</p>
            </div>
            <div className="metric-card">
              <h3>PBT</h3>
              <p className="metric-value">{formatCurrency(metrics.pbt)}</p>
            </div>
            <div className="metric-card highlight">
              <h3>PAT (Net Profit)</h3>
              <p className="metric-value">{formatCurrency(metrics.pat)}</p>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Daily Sales vs Costs</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="Sales" />
                  <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Profit Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card">
              <h3>Cost Breakdown</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span>Raw Material</span>
                  <span className="breakdown-value">{formatCurrency(metrics.costBreakdown.rawMaterial)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Labour</span>
                  <span className="breakdown-value">{formatCurrency(metrics.costBreakdown.labour)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Electricity</span>
                  <span className="breakdown-value">{formatCurrency(metrics.costBreakdown.electricity)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Rent</span>
                  <span className="breakdown-value">{formatCurrency(metrics.costBreakdown.rent)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Transport</span>
                  <span className="breakdown-value">{formatCurrency(metrics.costBreakdown.transport)}</span>
                </div>
              </div>
            </div>

            <div className="breakdown-card">
              <h3>Efficiency Metrics</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span>Total Quantity Sold</span>
                  <span className="breakdown-value">{metrics.totalQuantity.toFixed(2)} kg</span>
                </div>
                <div className="breakdown-item">
                  <span>Profit per Kg</span>
                  <span className="breakdown-value">{formatCurrency(metrics.profitPerKg)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Profit Margin</span>
                  <span className="breakdown-value">{metrics.marginPercentage.toFixed(2)}%</span>
                </div>
                <div className="breakdown-item">
                  <span>Depreciation</span>
                  <span className="breakdown-value">{formatCurrency(metrics.depreciation)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Tax (30%)</span>
                  <span className="breakdown-value">{formatCurrency(metrics.tax)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data">No data available for selected date range</div>
      )}
    </div>
  );
}

export default DashboardPage;
