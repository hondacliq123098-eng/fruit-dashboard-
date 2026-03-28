import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, ListFilter as Filter } from 'lucide-react';
import './CostsPage.css';

function CostsPage() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cost_type: 'Raw Material',
    amount: '',
    description: '',
    cost_date: new Date().toISOString().split('T')[0],
  });

  const costTypes = ['Raw Material', 'Labour', 'Electricity', 'Rent', 'Transport'];

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const { data, error } = await supabase.from('costs').select('*').order('cost_date', { ascending: false });

      if (error) throw error;
      setCosts(data || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('costs').insert([
      {
        cost_type: formData.cost_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        cost_date: formData.cost_date,
      },
    ]);

    if (error) {
      console.error('Error adding cost:', error);
      alert('Error adding cost');
    } else {
      setFormData({
        cost_type: 'Raw Material',
        amount: '',
        description: '',
        cost_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchCosts();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this cost entry?')) return;

    const { error } = await supabase.from('costs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting cost:', error);
      alert('Error deleting cost');
    } else {
      fetchCosts();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredCosts = filterType === 'All' ? costs : costs.filter((cost) => cost.cost_type === filterType);

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0);

  const costsByType = costTypes.map((type) => {
    const typeCosts = costs.filter((c) => c.cost_type === type);
    const total = typeCosts.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    return { type, total, count: typeCosts.length };
  });

  return (
    <div className="costs-page">
      <div className="page-header">
        <div>
          <h1>Costs Management</h1>
          <p className="page-subtitle">Track and manage business expenses</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          Add Cost
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add New Cost</h3>
          <form onSubmit={handleSubmit} className="cost-form">
            <div className="form-group">
              <label>Cost Type</label>
              <select
                value={formData.cost_type}
                onChange={(e) => setFormData({ ...formData, cost_type: e.target.value })}
                required
              >
                {costTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.cost_date}
                onChange={(e) => setFormData({ ...formData, cost_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Optional description..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Cost
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="costs-summary">
        <h3>Cost Summary by Type</h3>
        <div className="summary-grid">
          {costsByType.map((item) => (
            <div key={item.type} className="summary-card">
              <h4>{item.type}</h4>
              <p className="summary-amount">{formatCurrency(item.total)}</p>
              <p className="summary-count">{item.count} entries</p>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-box">
          <Filter size={20} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            {costTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="total-card">
          <span>Total Costs:</span>
          <span className="total-value">{formatCurrency(totalCosts)}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading costs data...</div>
      ) : filteredCosts.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cost Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosts.map((cost) => (
                <tr key={cost.id}>
                  <td>{new Date(cost.cost_date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`type-badge ${cost.cost_type.toLowerCase().replace(' ', '-')}`}>
                      {cost.cost_type}
                    </span>
                  </td>
                  <td className="amount-cell">{formatCurrency(cost.amount)}</td>
                  <td className="description-cell">{cost.description || '-'}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(cost.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">No cost records found</div>
      )}
    </div>
  );
}

export default CostsPage;
