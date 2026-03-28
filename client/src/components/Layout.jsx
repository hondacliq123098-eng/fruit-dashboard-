import { Link, useLocation } from 'react-router-dom';
import { Hop as Home, ChartBar as BarChart3, TrendingUp, DollarSign, Store } from 'lucide-react';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/sales', label: 'Sales', icon: TrendingUp },
    { path: '/costs', label: 'Costs', icon: DollarSign },
    { path: '/mandi-prices', label: 'Mandi Prices', icon: Store },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Store size={28} />
            <span>FreshBiz Manager</span>
          </div>
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
