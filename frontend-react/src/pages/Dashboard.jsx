// Dashboard.jsx - Shows summary statistics for the logged-in user
// Uses useEffect to fetch data when the page loads

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  // Get the logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  // State to hold the stats
  const [stats, setStats] = useState({
    total_medicines:  0,
    total_customers:  0,
    total_invoices:   0,
    total_sales:      0,
    low_stock:        0,
    expired_medicines: 0
  })

  // State to hold recently added medicines
  const [recentMeds, setRecentMeds] = useState([])

  // useEffect runs when the component first loads (like componentDidMount)
  useEffect(() => {
    fetchStats()
    fetchRecentMeds()
  }, [])

  // Fetch dashboard stats from backend
  async function fetchStats() {
    try {
      const res  = await fetch(`/dashboard/${user.user_id}`)
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  // Fetch recently added medicines
  async function fetchRecentMeds() {
    try {
      const res  = await fetch(`/dashboard/recent-medicines/${user.user_id}`)
      const data = await res.json()
      if (data.success) setRecentMeds(data.data)
    } catch (err) {
      console.error('Error loading recent medicines:', err)
    }
  }

  // Format date to readable format
  function formatDate(d) {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-IN')
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        {/* Header */}
        <div className="flex-between mb-20">
          <h1 className="page-title">📊 Dashboard</h1>
          <span className="text-muted">Welcome, {user.name}!</span>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="s-icon">💊</div>
            <div className="s-value">{stats.total_medicines}</div>
            <div className="s-label">Total Medicines</div>
          </div>
          <div className="stat-card">
            <div className="s-icon">👥</div>
            <div className="s-value">{stats.total_customers}</div>
            <div className="s-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="s-icon">🧾</div>
            <div className="s-value">{stats.total_invoices}</div>
            <div className="s-label">Total Invoices</div>
          </div>
          <div className="stat-card">
            <div className="s-icon">💰</div>
            <div className="s-value">₹{Number(stats.total_sales).toFixed(0)}</div>
            <div className="s-label">Total Sales</div>
          </div>
          <div className="stat-card">
            <div className="s-icon">⚠️</div>
            <div className="s-value" style={{ color: '#d97706' }}>{stats.low_stock}</div>
            <div className="s-label">Low Stock</div>
          </div>
          <div className="stat-card">
            <div className="s-icon">❌</div>
            <div className="s-value" style={{ color: '#dc2626' }}>{stats.expired_medicines}</div>
            <div className="s-label">Expired</div>
          </div>
        </div>

        {/* Recent Medicines Table */}
        <div className="card">
          <h3 className="mb-14" style={{ fontSize: '15px' }}>Recently Added Medicines</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Company</th>
                  <th>Quantity</th>
                  <th>Price (₹)</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {recentMeds.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '20px' }}>
                    No medicines added yet. Go to Medicines page to add some.
                  </td></tr>
                ) : (
                  recentMeds.map((m, i) => (
                    <tr key={i}>
                      <td>{m.medicine_name}</td>
                      <td>{m.company_name}</td>
                      <td>{m.quantity}</td>
                      <td>{Number(m.price).toFixed(2)}</td>
                      <td>{formatDate(m.expiry_date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
