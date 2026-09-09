// Login.jsx - User Login Page

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [alert, setAlert]       = useState({ msg: '', type: '' })
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAlert({ msg: '', type: '' })

    try {
      const res  = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.success) {
        // Save user info in localStorage so we know they're logged in
        // localStorage persists even after browser refresh
        localStorage.setItem('medistock_user', JSON.stringify(data.user))

        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        setAlert({ msg: data.message || 'Login failed', type: 'error' })
      }
    } catch (err) {
      setAlert({ msg: 'Cannot connect to server. Make sure backend is running.', type: 'error' })
    }

    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>
        <p className="sub">Login to access your pharmacy dashboard</p>

        {alert.msg && (
          <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-12 text-muted">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
