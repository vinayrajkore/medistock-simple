// Register.jsx - User Registration Page
// Uses useState to handle form data and fetch() to send to backend

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  // Form state - stores what the user types
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Alert state - shows success or error messages
  const [alert, setAlert] = useState({ msg: '', type: '' })
  const [loading, setLoading] = useState(false)

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault()  // Prevent page refresh
    setLoading(true)
    setAlert({ msg: '', type: '' })

    try {
      // POST request to backend
      const res  = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()

      if (data.success) {
        setAlert({ msg: data.message, type: 'success' })
        // Wait 1.5 seconds then redirect to login
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setAlert({ msg: data.message || 'Registration failed', type: 'error' })
      }
    } catch (err) {
      setAlert({ msg: 'Cannot connect to server. Make sure backend is running.', type: 'error' })
    }

    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p className="sub">Register to manage your pharmacy</p>

        {/* Show alert if there is a message */}
        {alert.msg && (
          <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-12 text-muted">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
