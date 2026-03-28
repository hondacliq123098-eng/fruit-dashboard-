import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store, TrendingUp, TrendingDown } from 'lucide-react';
import './MandiPricesPage.css';

function MandiPricesPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase.from('mandi_prices').select('*').order('price_date', { ascending: false });

      if (error) throw error;
      setPrices(data || []);
    } catch (error) {
      console.error('Error fetching mandi prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const groupedPrices = prices.reduce((acc, price) => {
    if (!acc[price.product_name]) {
      acc[price.product_name] = [];
    }
    acc[price.product_name].push(price);
    return acc;
  }, {});

  return (
    <div className="mandi-prices-page">
      <div className="page-header">
        <div>
          <h1>Mandi Prices</h1>
          <p className="page-subtitle">Latest market prices from major mandis across India</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading mandi prices...</div>
      ) : Object.keys(groupedPrices).length > 0 ? (
        <div className="prices-grid">
          {Object.entries(groupedPrices).map(([productName, productPrices]) => {
            const latestPrice = productPrices[0];
            const priceRange = parseFloat(latestPrice.max_price) - parseFloat(latestPrice.min_price);
            const modalPrice = parseFloat(latestPrice.modal_price);

            return (
              <div key={productName} className="price-card">
                <div className="price-header">
                  <div className="product-info">
                    <Store size={24} className="product-icon" />
                    <h3>{productName}</h3>
                  </div>
                  <div className="modal-price">{formatCurrency(modalPrice)}</div>
                </div>

                <div className="price-details">
                  <div className="price-item">
                    <TrendingDown size={18} className="icon-down" />
                    <div>
                      <p className="label">Minimum</p>
                      <p className="value">{formatCurrency(latestPrice.min_price)}</p>
                    </div>
                  </div>

                  <div className="price-item">
                    <TrendingUp size={18} className="icon-up" />
                    <div>
                      <p className="label">Maximum</p>
                      <p className="value">{formatCurrency(latestPrice.max_price)}</p>
                    </div>
                  </div>
                </div>

                <div className="price-range-bar">
                  <div
                    className="range-indicator"
                    style={{
                      left: `${((modalPrice - parseFloat(latestPrice.min_price)) / priceRange) * 100}%`,
                    }}
                  />
                </div>

                <div className="market-info">
                  <div className="info-item">
                    <span className="info-label">Market:</span>
                    <span className="info-value">{latestPrice.market || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">State:</span>
                    <span className="info-value">{latestPrice.state || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">
                      {new Date(latestPrice.price_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {productPrices.length > 1 && (
                  <div className="historical-section">
                    <h4>Recent Prices</h4>
                    <div className="historical-list">
                      {productPrices.slice(1, 4).map((price, idx) => (
                        <div key={idx} className="historical-item">
                          <span>{new Date(price.price_date).toLocaleDateString('en-IN')}</span>
                          <span className="historical-price">{formatCurrency(price.modal_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-data">No mandi price data available</div>
      )}

      <div className="info-banner">
        <Store size={24} />
        <div>
          <h4>About Mandi Prices</h4>
          <p>
            Mandi prices are updated regularly from Agricultural Produce Market Committees (APMC) across India. These
            prices represent wholesale rates and can vary based on quality, season, and market demand.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MandiPricesPage;
