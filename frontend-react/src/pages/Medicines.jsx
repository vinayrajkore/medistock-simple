// Medicines.jsx - Medicine Inventory Management (CRUD)
// Create, Read, Update, Delete medicines

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

// Empty form state (used to reset form)
const emptyForm = {
  medicine_name: '',
  company_name: '',
  batch_no: '',
  expiry_date: '',
  quantity: '',
  price: ''
}

function Medicines() {
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  const [medicines, setMedicines]   = useState([])   // All medicines list
  const [filtered,  setFiltered]    = useState([])   // Filtered by search
  const [search,    setSearch]      = useState('')   // Search input value

  const [showModal, setShowModal]   = useState(false)  // Is modal open?
  const [editId,    setEditId]      = useState(null)   // null = adding, number = editing
  const [form,      setForm]        = useState(emptyForm)  // Form fields

  const [alert,    setAlert]    = useState({ msg: '', type: '' })  // Main page alert
  const [modAlert, setModAlert] = useState({ msg: '', type: '' })  // Modal alert

  // Load medicines when page opens
  useEffect(() => {
    loadMedicines()
  }, [])

  async function loadMedicines() {
    try {
      const res  = await fetch(`/medicines/${user.user_id}`)
      const data = await res.json()
      if (data.success) {
        setMedicines(data.data)
        setFiltered(data.data)
      }
    } catch (err) {
      showAlert('Could not load medicines', 'error')
    }
  }

  // Filter medicines by search query
  function handleSearch(e) {
    const q = e.target.value.toLowerCase()
    setSearch(q)
    setFiltered(medicines.filter(m => m.medicine_name.toLowerCase().includes(q)))
  }

  // Open modal to ADD a new medicine
  function openAdd() {
    setEditId(null)
    setForm(emptyForm)
    setModAlert({ msg: '', type: '' })
    setShowModal(true)
  }

  // Open modal to EDIT an existing medicine
  function openEdit(med) {
    setEditId(med.medicine_id)
    setForm({
      medicine_name: med.medicine_name,
      company_name:  med.company_name,
      batch_no:      med.batch_no,
      expiry_date:   med.expiry_date ? med.expiry_date.substring(0, 10) : '',
      quantity:      med.quantity,
      price:         med.price
    })
    setModAlert({ msg: '', type: '' })
    setShowModal(true)
  }

  // Handle form field change
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Save medicine (Add or Edit)
  async function handleSave(e) {
    e.preventDefault()
    setModAlert({ msg: '', type: '' })

    try {
      let res, data

      if (editId) {
        // Update existing medicine
        res  = await fetch(`/medicines/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, user_id: user.user_id })
        })
      } else {
        // Add new medicine
        res  = await fetch('/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, user_id: user.user_id })
        })
      }

      data = await res.json()

      if (data.success) {
        setShowModal(false)
        showAlert(data.message, 'success')
        loadMedicines()  // Refresh the list
      } else {
        setModAlert({ msg: data.message || 'Failed to save', type: 'error' })
      }
    } catch (err) {
      setModAlert({ msg: 'Server error. Try again.', type: 'error' })
    }
  }

  // Delete a medicine
  async function handleDelete(medicineId) {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    try {
      const res  = await fetch(`/medicines/${medicineId}?user_id=${user.user_id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        showAlert('Medicine deleted successfully', 'success')
        loadMedicines()
      } else {
        showAlert(data.message || 'Delete failed', 'error')
      }
    } catch (err) {
      showAlert('Server error', 'error')
    }
  }

  function showAlert(msg, type) {
    setAlert({ msg, type })
    setTimeout(() => setAlert({ msg: '', type: '' }), 4000)
  }

  // Check if a medicine is expired
  function isExpired(date) {
    return date && new Date(date) < new Date()
  }

  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN') : 'N/A'
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        {/* Header row with title and Add button */}
        <div className="flex-between mb-20">
          <h1 className="page-title">💊 Medicines</h1>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Medicine</button>
        </div>

        {/* Alert */}
        {alert.msg && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Search */}
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by medicine name..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine Name</th>
                  <th>Company</th>
                  <th>Batch No.</th>
                  <th>Expiry</th>
                  <th>Qty</th>
                  <th>Price (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted" style={{ padding: '20px' }}>
                      No medicines found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, i) => {
                    const expired  = isExpired(m.expiry_date)
                    const lowStock = m.quantity <= 10

                    let badge = <span className="badge badge-ok">OK</span>
                    if (expired)       badge = <span className="badge badge-expired">Expired</span>
                    else if (lowStock) badge = <span className="badge badge-low">Low Stock</span>

                    return (
                      <tr key={m.medicine_id}>
                        <td>{i + 1}</td>
                        <td><strong>{m.medicine_name}</strong></td>
                        <td>{m.company_name}</td>
                        <td>{m.batch_no}</td>
                        <td>{formatDate(m.expiry_date)}</td>
                        <td>{m.quantity}</td>
                        <td>{Number(m.price).toFixed(2)}</td>
                        <td>{badge}</td>
                        <td style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(m)}>Edit</button>
                          <button className="btn btn-danger  btn-sm" onClick={() => handleDelete(m.medicine_id)}>Delete</button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <div className={`modal-bg ${showModal ? 'open' : ''}`}>
        <div className="modal-box">
          <div className="modal-head">
            <h3>{editId ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>

          {modAlert.msg && <div className={`alert alert-${modAlert.type}`}>{modAlert.msg}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Medicine Name</label>
              <input name="medicine_name" value={form.medicine_name} onChange={handleChange} placeholder="e.g. Paracetamol" required />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="e.g. Sun Pharma" required />
            </div>
            <div className="form-group">
              <label>Batch Number</label>
              <input name="batch_no" value={form.batch_no} onChange={handleChange} placeholder="e.g. BAT001" required />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 100" min="0" required />
              </div>
            </div>
            <div className="form-group">
              <label>Price per unit (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 15.50" min="0" step="0.01" required />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Medicines
