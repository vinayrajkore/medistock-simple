import { useEffect, useState } from 'react';
import { getSession, getDashboardStats } from '../utils/storage';

export default function Dashboard() {
  const session = getSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (session) setStats(getDashboardStats(session.id));
  }, []);

  if (!stats) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{session?.name}</strong>!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">💊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalMedicines}</div>
            <div className="stat-label">Total Medicines</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.lowStock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.expiringSoon}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🧾</div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalBills}</div>
            <div className="stat-label">Total Invoices</div>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="revenue-card">
        <span>💰 Total Revenue</span>
        <span className="revenue-amount">₹{stats.totalRevenue.toFixed(2)}</span>
      </div>

      {/* Recent Medicines */}
      <div className="section-card">
        <h3>Recent Medicines</h3>
        {stats.recentMeds.length === 0 ? (
          <p className="empty-msg">No medicines added yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              {stats.recentMeds.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.category}</td>
                  <td className={Number(m.quantity) <= 10 ? 'low-stock' : ''}>{m.quantity}</td>
                  <td>₹{m.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Bills */}
      <div className="section-card">
        <h3>Recent Invoices</h3>
        {stats.recentBills.length === 0 ? (
          <p className="empty-msg">No invoices generated yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {stats.recentBills.map(b => (
                <tr key={b.id}>
                  <td>{b.invoiceNo}</td>
                  <td>{b.customerName}</td>
                  <td>₹{Number(b.total).toFixed(2)}</td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
