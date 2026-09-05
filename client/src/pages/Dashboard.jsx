import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_amount: 0,
    total_count: 0,
    current_month_total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await api.getDashboard();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/expenses/add" className="btn btn-primary">
          + Add Expense
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading dashboard metrics...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-label">Total Expenses</div>
              <div className="card-value highlight">
                {formatCurrency(metrics.total_amount)}
              </div>
            </div>

            <div className="card">
              <div className="card-label">Number of Expenses</div>
              <div className="card-value">
                {metrics.total_count}
              </div>
            </div>

            <div className="card">
              <div className="card-label">Current Month's Total</div>
              <div className="card-value">
                {formatCurrency(metrics.current_month_total)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/expenses" className="btn btn-secondary">
              View All Expenses →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
