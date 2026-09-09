// History.jsx - Invoice History Page
// Shows all past invoices with search

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

function History() {
  const user = JSON.parse(localStorage.getItem('medistock_user'))

  const [allRecords, setAllRecords] = useState([])  // All invoice records
  const [filtered,   setFiltered]   = useState([])  // After search filter
  const [search,     setSearch]     = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const res  = await fetch(`/history/${user.user_id}`)
      const data = await res.json()
      if (data.success) {
        setAllRecords(data.data)
        setFiltered(data.data)
      }
    } catch (err) {
      console.error('Error loading history:', err)
    }
  }

  function handleSearch(e) {
    const q = e.target.value.toLowerCase()
    setSearch(q)
    setFiltered(allRecords.filter(r =>
      r.invoice_no.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      r.medicine_name.toLowerCase().includes(q)
    ))
  }

  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN') : 'N/A'
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <h1 className="page-title">📜 Invoice History</h1>

        <div className="search-row">
          <input
            type="text"
            placeholder="Search by invoice no, customer name, or medicine..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Doctor</th>
                  <th>Visit Date</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted" style={{ padding: '20px' }}>
                      No invoice records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.invoice_no}</strong></td>
                      <td>{r.customer_name}</td>
                      <td>{r.mobile}</td>
                      <td>{r.doctor_name}</td>
                      <td>{formatDate(r.visit_date)}</td>
                      <td>{r.medicine_name}</td>
                      <td>{r.quantity}</td>
                      <td>₹{Number(r.price).toFixed(2)}</td>
                      <td><strong>₹{Number(r.total_amount).toFixed(2)}</strong></td>
                      <td>{formatDate(r.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default History
