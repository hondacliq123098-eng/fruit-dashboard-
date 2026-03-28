import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Search } from 'lucide-react';
import './SalesPage.css';

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_kg: '',
    price_per_kg: '',
    sale_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        supabase.from('sales').select('*, products(name, category)').order('sale_date', { ascending: false }),
        supabase.from('products').select('*').order('name'),
      ]);

      setSales(salesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalAmount = parseFloat(formData.quantity_kg) * parseFloat(formData.price_per_kg);

    const { error } = await supabase.from('sales').insert([
      {
        product_id: formData.product_id,
        quantity_kg: parseFloat(formData.quantity_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
        total_amount: totalAmount,
        sale_date: formData.sale_date,
      },
    ]);

    if (error) {
      console.error('Error adding sale:', error);
      alert('Error adding sale');
    } else {
      setFormData({
        product_id: '',
        quantity_kg: '',
        price_per_kg: '',
        sale_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    const { error } = await supabase.from('sales').delete().eq('id', id);

    if (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale');
    } else {
      fetchData();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredSales = sales.filter((sale) =>
    sale.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1>Sales Management</h1>
          <p className="page-subtitle">Record and track all sales transactions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          Add Sale
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Add New Sale</h3>
          <form onSubmit={handleSubmit} className="sale-form">
            <div className="form-group">
              <label>Product</label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity_kg}
                onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Price per Kg</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_per_kg}
                onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Sale Date</label>
              <input
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                required
              />
            </div>

            {formData.quantity_kg && formData.price_per_kg && (
              <div className="total-display">
                Total: {formatCurrency(parseFloat(formData.quantity_kg) * parseFloat(formData.price_per_kg))}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Sale
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="summary-card">
          <span>Total Sales:</span>
          <span className="total-value">{formatCurrency(totalSales)}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading sales data...</div>
      ) : filteredSales.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity (kg)</th>
                <th>Price/kg</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.sale_date).toLocaleDateString('en-IN')}</td>
                  <td>{sale.products?.name}</td>
                  <td>
                    <span className="category-badge">{sale.products?.category}</span>
                  </td>
                  <td>{parseFloat(sale.quantity_kg).toFixed(2)}</td>
                  <td>{formatCurrency(sale.price_per_kg)}</td>
                  <td className="amount-cell">{formatCurrency(sale.total_amount)}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(sale.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">No sales records found</div>
      )}
    </div>
  );
}

export default SalesPage;
