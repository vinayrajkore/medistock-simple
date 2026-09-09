// Sidebar.jsx
// The left navigation sidebar shown on all logged-in pages

import { NavLink, useNavigate } from 'react-router-dom'

function Sidebar() {
  const navigate = useNavigate()

  // Logout: clear user from storage and go to login
  function handleLogout() {
    localStorage.removeItem('medistock_user')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <a href="/home" className="sidebar-brand">💊 MediStock</a>

      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/medicines" className={({ isActive }) => isActive ? 'active' : ''}>
          💊 Medicines
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>
          🧾 Billing
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
          📜 History
        </NavLink>
        <NavLink to="/chatbot" className={({ isActive }) => isActive ? 'active' : ''}>
          🤖 Chatbot
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          👤 Profile
        </NavLink>
      </nav>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  )
}

export default Sidebar
