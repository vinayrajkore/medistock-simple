import { useState, useEffect } from 'react';
import { getSession, getMedicines, addMedicine, updateMedicine, deleteMedicine } from '../utils/storage';

const CATEGORIES = ['Tablet','Capsule','Syrup','Injection','Cream','Drops','Other'];

export default function Medicines() {
  const session = getSession();
  const [meds, setMeds]     = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name: '', category: 'Tablet', price: '', quantity: '', expiry: '', description: '' });
  const [msg, setMsg]       = useState('');

  function load() { setMeds(getMedicines(session.id)); }
  useEffect(() => { load(); }, []);

  function openAdd()   { setForm({ name:'', category:'Tablet', price:'', quantity:'', expiry:'', description:'' }); setEditing(null); setModal(true); }
  function openEdit(m) { setForm({ name:m.name, category:m.category, price:m.price, quantity:m.quantity, expiry:m.expiry||'', description:m.description||'' }); setEditing(m); setModal(true); }
  function closeModal(){ setModal(false); setMsg(''); }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity) { setMsg('Name, price and quantity are required.'); return; }
    if (editing) {
      updateMedicine(session.id, editing.id, form);
    } else {
      addMedicine(session.id, form);
    }
    load(); closeModal();
  }

  function handleDelete(id) {
    if (!confirm('Delete this medicine?')) return;
    deleteMedicine(session.id, id);
    load();
  }

  const filtered = meds.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Medicines</h1>
        <button className="btn-primary" onClick={openAdd}>+ Add Medicine</button>
      </div>

      <div className="search-bar">
        <input placeholder="Search medicines…" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty-msg">No medicines found. Add one!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Category</th><th>Price (₹)</th><th>Qty</th><th>Expiry</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.category}</td>
                  <td>₹{m.price}</td>
                  <td className={Number(m.quantity) <= 10 ? 'low-stock' : ''}>{m.quantity}</td>
                  <td>{m.expiry || '—'}</td>
                  <td>
                    <button className="btn-sm btn-edit" onClick={() => openEdit(m)}>Edit</button>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              {msg && <div className="alert error">{msg}</div>}
              <div className="form-group">
                <label>Medicine Name *</label>
                <input name="name" placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={handleChange}/>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input name="expiry" type="date" value={form.expiry} onChange={handleChange}/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange}/>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input name="quantity" type="number" min="0" placeholder="0" value={form.quantity} onChange={handleChange}/>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input name="description" placeholder="Optional notes" value={form.description} onChange={handleChange}/>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add Medicine'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
