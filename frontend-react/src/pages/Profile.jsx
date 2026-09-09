import { useState, useEffect } from 'react';
import { getSession, updateProfile } from '../utils/storage';

export default function Profile() {
  const [session, setSession] = useState(getSession());
  const [form, setForm]   = useState({ name:'', phone:'', pharmacy:'' });
  const [msg, setMsg]     = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) setForm({ name: session.name || '', phone: session.phone || '', pharmacy: session.pharmacy || '' });
  }, []);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  function handleSave(e) {
    e.preventDefault();
    setMsg(''); setError('');
    if (!form.name) { setError('Name is required.'); return; }
    updateProfile(session.id, form);
    setSession(getSession());
    setMsg('Profile updated successfully!');
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div className="page">
      <div className="page-header"><h1>My Profile</h1></div>

      <div className="table-card" style={{maxWidth:'500px'}}>
        <div style={{textAlign:'center',marginBottom:'20px'}}>
          <div style={{fontSize:'64px'}}>👤</div>
          <h3>{session?.name}</h3>
          <p style={{color:'#607d8b',fontSize:'13px'}}>{session?.email}</p>
        </div>

        {msg   && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={session?.email || ''} disabled style={{background:'#f5f5f5',cursor:'not-allowed'}}/>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number"/>
          </div>
          <div className="form-group">
            <label>Pharmacy Name</label>
            <input name="pharmacy" value={form.pharmacy} onChange={handleChange} placeholder="Your pharmacy"/>
          </div>
          <button type="submit" className="btn-primary" style={{width:'100%'}}>
            💾 Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
