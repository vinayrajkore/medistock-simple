import { useState, useEffect } from 'react';
import { getSession, getBills } from '../utils/storage';

export default function History() {
  const session = getSession();
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const all = getBills(session.id);
    setBills([...all].sort((a, b) => b.id - a.id));
  }, []);

  const filtered = bills.filter(b =>
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.invoiceNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header"><h1>Invoice History</h1></div>

      <div className="search-bar">
        <input placeholder="Search by customer or invoice no…" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty-msg">No invoices found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Invoice No</th><th>Customer</th><th>Total</th><th>Date</th><th>Details</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <>
                  <tr key={b.id}>
                    <td><strong>{b.invoiceNo}</strong></td>
                    <td>{b.customerName}</td>
                    <td>₹{Number(b.total).toFixed(2)}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-sm btn-edit" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                        {expanded === b.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expanded === b.id && (
                    <tr key={b.id + '-detail'}>
                      <td colSpan="5" style={{background:'#f8fbff',padding:'12px 20px'}}>
                        <table className="data-table" style={{margin:0}}>
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                          <tbody>
                            {b.items.map((it, i) => (
                              <tr key={i}>
                                <td>{it.name}</td>
                                <td>{it.quantity}</td>
                                <td>₹{it.price}</td>
                                <td>₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
