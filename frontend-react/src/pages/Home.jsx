// Home.jsx - Landing page (public, no login needed)

import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="logo">💊 MediStock</div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/login" className="nav-btn">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>💊 MediStock</h1>
        <p>A simple pharmacy inventory management system to track medicines, manage customers, and generate bills.</p>
        <div className="hero-btns">
          <Link to="/register" className="btn btn-white">Get Started</Link>
          <Link to="/login" className="btn" style={{ border: '1px solid white', color: 'white', background: 'transparent' }}>
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>What can MediStock do?</h2>
        <p>Everything a pharmacy needs to manage day-to-day operations</p>

        <div className="features-grid">
          <div className="feature-card">
            <span className="f-icon">📊</span>
            <h4>Dashboard</h4>
            <p>View total medicines, customers, invoices, sales, low stock, and expired medicines.</p>
          </div>
          <div className="feature-card">
            <span className="f-icon">💊</span>
            <h4>Medicine Management</h4>
            <p>Add, edit, delete medicines with name, company, batch number, expiry, quantity, and price.</p>
          </div>
          <div className="feature-card">
            <span className="f-icon">🧾</span>
            <h4>Billing System</h4>
            <p>Generate invoices, auto-deduct stock from inventory, and track total sales.</p>
          </div>
          <div className="feature-card">
            <span className="f-icon">📜</span>
            <h4>Invoice History</h4>
            <p>View complete history of all past invoices and customer purchases.</p>
          </div>
          <div className="feature-card">
            <span className="f-icon">🤖</span>
            <h4>Smart Chatbot</h4>
            <p>Ask questions about your inventory in plain English.</p>
          </div>
          <div className="feature-card">
            <span className="f-icon">👤</span>
            <h4>User Profiles</h4>
            <p>Each pharmacy owner has their own private account and data.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2024 MediStock — Pharmacy Inventory System</p>
      </footer>
    </div>
  )
}

export default Home
