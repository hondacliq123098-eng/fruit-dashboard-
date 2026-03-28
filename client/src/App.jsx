import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import CostsPage from './pages/CostsPage';
import MandiPricesPage from './pages/MandiPricesPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/costs" element={<CostsPage />} />
          <Route path="/mandi-prices" element={<MandiPricesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
