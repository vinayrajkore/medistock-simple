// Profile.jsx - User Profile Page
// View and update the user's name

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

function Profile() {
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [joined,  setJoined]  = useState('')
  const [alert,   setAlert]   = useState({ msg: '', type: '' })
  const [loading, setLoading] = useState(false)

  // Load profile data when page opens
  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res  = await fetch(`/profile/${user.user_id}`)
      const data = await res.json()
      if (data.success) {
        setName(data.user.name)
        setEmail(data.user.email)
        setJoined(data.user.created_at ? new Date(data.user.created_at).toLocaleDateString('en-IN') : '')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  // Update name
  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setAlert({ msg: '', type: '' })

    try {
      const res  = await fetch(`/profile/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()

      if (data.success) {
        // Also update the name stored in localStorage
        const updatedUser = { ...user, name }
        localStorage.setItem('medistock_user', JSON.stringify(updatedUser))
        showAlert('Name updated successfully!', 'success')
      } else {
        showAlert(data.message || 'Update failed', 'error')
      }
    } catch (err) {
      showAlert('Server error', 'error')
    }

    setLoading(false)
  }

  function showAlert(msg, type) {
    setAlert({ msg, type })
    setTimeout(() => setAlert({ msg: '', type: '' }), 4000)
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <h1 className="page-title">👤 Profile</h1>

        {alert.msg && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        <div className="card" style={{ maxWidth: '440px' }}>
          {/* Avatar with first letter of name */}
          <div className="text-center mb-20">
            <div className="profile-avatar">{name.charAt(0).toUpperCase() || '?'}</div>
            <p className="text-muted">{email}</p>
            {joined && <p className="text-muted" style={{ fontSize: '12px' }}>Joined: {joined}</p>}
          </div>

          {/* Edit name form */}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address (cannot be changed)</label>
              <input
                type="email"
                value={email}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Profile
