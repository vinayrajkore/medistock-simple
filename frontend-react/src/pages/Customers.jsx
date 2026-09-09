// Customers.jsx - Billing Page
// Generate a bill for a customer, select medicines, auto-deduct stock

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

function Customers() {
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  // Customer info fields
  const [customerId,   setCustomerId]   = useState('')
  const [customerName, setCustomerName] = useState('')
  const [mobile,       setMobile]       = useState('')
  const [doctorName,   setDoctorName]   = useState('')
  const [visitDate,    setVisitDate]    = useState(new Date().toISOString().split('T')[0])

  // List of bill items (each item = one medicine + quantity)
  const [items, setItems] = useState([{ medicine_id: '', quantity: 1 }])

  // All medicines list for the dropdown
  const [medicines, setMedicines] = useState([])

  const [alert, setAlert]     = useState({ msg: '', type: '' })
  const [loading, setLoading] = useState(false)

  // Load medicines on page open
  useEffect(() => {
    loadMedicines()
  }, [])

  async function loadMedicines() {
    try {
      const res  = await fetch(`/medicines/${user.user_id}`)
      const data = await res.json()
      if (data.success) setMedicines(data.data)
    } catch (err) {
      showAlert('Could not load medicines', 'error')
    }
  }

  // Add a new medicine row to the bill
  function addItem() {
    setItems([...items, { medicine_id: '', quantity: 1 }])
  }

  // Remove a medicine row from the bill
  function removeItem(index) {
    if (items.length === 1) return  // Keep at least one row
    setItems(items.filter((_, i) => i !== index))
  }

  // Update a medicine item (medicine_id or quantity)
  function updateItem(index, field, value) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setItems(updated)
  }

  // Calculate grand total
  function getTotal() {
    return items.reduce((sum, item) => {
      const med = medicines.find(m => String(m.medicine_id) === String(item.medicine_id))
      return sum + (med ? med.price * item.quantity : 0)
    }, 0)
  }

  // Generate the bill
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAlert({ msg: '', type: '' })

    // Check all medicine rows have a medicine selected
    for (const item of items) {
      if (!item.medicine_id) {
        showAlert('Please select a medicine for all rows', 'error')
        setLoading(false)
        return
      }
    }

    try {
      const res  = await fetch('/bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id:   customerId,
          customer_name: customerName,
          mobile,
          doctor_name:   doctorName,
          visit_date:    visitDate,
          user_id:       user.user_id,
          items: items.map(i => ({ medicine_id: i.medicine_id, quantity: Number(i.quantity) }))
        })
      })

      const data = await res.json()

      if (data.success) {
        showAlert(
          `✅ Bill generated! Invoice: ${data.invoice_no} | Total: ₹${Number(data.total_amount).toFixed(2)}`,
          'success'
        )
        // Reset form
        setCustomerId(''); setCustomerName(''); setMobile(''); setDoctorName('')
        setItems([{ medicine_id: '', quantity: 1 }])
        loadMedicines()  // Refresh medicines to show updated stock
      } else {
        showAlert(data.message || 'Failed to generate bill', 'error')
      }
    } catch (err) {
      showAlert('Server error. Try again.', 'error')
    }

    setLoading(false)
  }

  function showAlert(msg, type) {
    setAlert({ msg, type })
    setTimeout(() => setAlert({ msg: '', type: '' }), 6000)
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <h1 className="page-title">🧾 Generate Bill</h1>

        {alert.msg && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        <div className="card max-w-600">
          <form onSubmit={handleSubmit}>
            {/* Customer Details */}
            <h3 className="mb-14" style={{ fontSize: '14px', color: '#6b7280' }}>Customer Details</h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Customer ID</label>
                <input value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="e.g. CUST001" required />
              </div>
              <div className="form-group">
                <label>Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Patient's full name" required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit number" required />
              </div>
              <div className="form-group">
                <label>Doctor Name</label>
                <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Prescribed by" required />
              </div>
              <div className="form-group">
                <label>Visit Date</label>
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required />
              </div>
            </div>

            <hr style={{ margin: '14px 0', borderColor: '#e5e7eb' }} />

            {/* Medicine Items */}
            <h3 className="mb-14" style={{ fontSize: '14px', color: '#6b7280' }}>Medicines</h3>

            {items.map((item, index) => (
              <div className="bill-item" key={index}>
                {/* Medicine dropdown */}
                <select
                  value={item.medicine_id}
                  onChange={e => updateItem(index, 'medicine_id', e.target.value)}
                  required
                >
                  <option value="">-- Select Medicine --</option>
                  {medicines.map(m => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.medicine_name} (Stock: {m.quantity}, ₹{m.price})
                    </option>
                  ))}
                </select>

                {/* Quantity */}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                />

                {/* Line total */}
                <span style={{ fontSize: '13px', textAlign: 'right' }}>
                  ₹{(() => {
                    const med = medicines.find(m => String(m.medicine_id) === String(item.medicine_id))
                    return med ? (med.price * item.quantity).toFixed(2) : '0.00'
                  })()}
                </span>

                {/* Remove button */}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>✕</button>
              </div>
            ))}

            <button type="button" className="btn btn-outline btn-sm mb-14" onClick={addItem}>
              + Add Medicine
            </button>

            {/* Grand Total */}
            <div className="text-right mb-14" style={{ fontWeight: '700', fontSize: '15px' }}>
              Grand Total: ₹{getTotal().toFixed(2)}
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Bill'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Customers
