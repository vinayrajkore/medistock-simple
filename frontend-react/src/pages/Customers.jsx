import { useState, useEffect } from 'react';
import { getSession, getMedicines, addBill } from '../utils/storage';

export default function Customers() {
  const session = getSession();
  const [meds, setMeds]           = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems]         = useState([{ medicineId: '', name: '', price: '', quantity: 1 }]);
  const [bill, setBill]           = useState(null);
  const [error, setError]         = useState('');

  useEffect(() => { setMeds(getMedicines(session.id)); }, []);

  function addItem() {
    setItems([...items, { medicineId: '', name: '', price: '', quantity: 1 }]);
  }

  function removeItem(i) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function selectMed(i, medId) {
    const med = meds.find(m => String(m.id) === String(medId));
    const updated = [...items];
    updated[i] = { medicineId: medId, name: med?.name || '', price: med?.price || '', quantity: 1 };
    setItems(updated);
  }

  function updateQty(i, qty) {
    const updated = [...items];
    updated[i].quantity = qty;
    setItems(updated);
  }

  const total = items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity || 0)), 0);

  function handleGenerate(e) {
    e.preventDefault();
    setError('');
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (items.some(it => !it.medicineId)) { setError('Please select a medicine for each row.'); return; }
    const result = addBill(session.id, { customerName, items });
    setBill(result);
    setCustomerName('');
    setItems([{ medicineId: '', name: '', price: '', quantity: 1 }]);
    setMeds(getMedicines(session.id)); // refresh stock
  }

  function printBill() { window.print(); }

  return (
    <div className="page">
      <div className="page-header"><h1>Billing</h1></div>

      <div className="table-card">
        <h3>Generate Invoice</h3>
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Customer Name *</label>
            <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)}/>
          </div>

          <table className="data-table" style={{marginTop:'12px'}}>
            <thead>
              <tr><th>Medicine</th><th>Price (₹)</th><th>Qty</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <select value={it.medicineId} onChange={e => selectMed(i, e.target.value)}>
                      <option value="">-- Select --</option>
                      {meds.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}
                    </select>
                  </td>
                  <td>₹{it.price || '0'}</td>
                  <td><input type="number" min="1" value={it.quantity} onChange={e => updateQty(i, e.target.value)} style={{width:'70px'}}/></td>
                  <td>₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                  <td><button type="button" className="btn-sm btn-delete" onClick={() => removeItem(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{display:'flex',gap:'10px',marginTop:'12px',alignItems:'center'}}>
            <button type="button" className="btn-secondary" onClick={addItem}>+ Add Item</button>
            <strong style={{marginLeft:'auto'}}>Total: ₹{total.toFixed(2)}</strong>
          </div>

          <button type="submit" className="btn-primary" style={{marginTop:'16px',width:'100%'}}>
            🧾 Generate Invoice
          </button>
        </form>
      </div>

      {/* Bill Preview */}
      {bill && (
        <div className="table-card" id="print-area">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3>✅ Invoice Generated</h3>
            <button className="btn-secondary" onClick={printBill}>🖨 Print</button>
          </div>
          <p><strong>Invoice No:</strong> {bill.invoiceNo}</p>
          <p><strong>Customer:</strong> {bill.customerName}</p>
          <p><strong>Date:</strong> {new Date(bill.date).toLocaleString()}</p>
          <table className="data-table" style={{marginTop:'10px'}}>
            <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {bill.items.map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.price}</td>
                  <td>₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{textAlign:'right',marginTop:'10px',fontSize:'18px',fontWeight:'700'}}>
            Total: ₹{Number(bill.total).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
