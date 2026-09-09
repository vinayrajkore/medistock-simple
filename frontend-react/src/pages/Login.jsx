import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password required.'); return; }
    setLoading(true);
    try {
      const session = loginUser(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💊</div>
        <h2>Welcome Back</h2>
        <p className="auth-sub">Login to MediStock</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange}/>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
