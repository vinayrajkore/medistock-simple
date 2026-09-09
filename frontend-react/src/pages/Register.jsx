import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/storage';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '', pharmacy: '' });
  const [msg, setMsg]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMsg('');
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    setLoading(true);
    try {
      registerUser(form);
      setMsg('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💊</div>
        <h2>Create Account</h2>
        <p className="auth-sub">Join MediStock — manage your pharmacy</p>

        {msg   && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" placeholder="Your name" value={form.name} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input name="password" type="password" placeholder="Choose a password" value={form.password} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Pharmacy Name</label>
            <input name="pharmacy" placeholder="Your pharmacy name" value={form.pharmacy} onChange={handleChange}/>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
