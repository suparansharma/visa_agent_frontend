"use client";
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function MonthlyExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  });
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [payDetail, setPayDetail] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [history, setHistory] = useState([]);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    monthYear: selectedMonth,
    category: "House Rent",
    amount: "",
    note: ""
  });

  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/monthly-expenses", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    if (user) {
      fetchExpenses();
      fetchEmployees();
    }
  }, [user]);

  const filteredExpenses = expenses.filter(e => e.monthYear === selectedMonth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:5000/api/monthly-expenses/${editId}` : "http://localhost:5000/api/monthly-expenses";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchExpenses();
        setModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ ...formData, amount: "", note: "" });
      }
    } catch (err) { console.error(err); }
  };

  const handlePayClick = (exp) => {
    setPayDetail(exp);
    setPayAmount(exp.due !== undefined ? exp.due : exp.amount);
    setPayNote("");
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    try {
      const res = await fetch(`http://localhost:5000/api/monthly-expenses/${payDetail._id}/pay`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ amount, note: payNote })
      });
      if (res.ok) {
        fetchExpenses();
        setPayDetail(null);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleView = async (exp) => {
    setViewItem(exp);
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/history/${exp.codeNo}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const handleEdit = (exp) => {
    setFormData({
      monthYear: exp.monthYear,
      category: exp.category,
      amount: exp.amount,
      note: exp.note || ""
    });
    setEditId(exp._id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/monthly-expenses/${deleteId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchExpenses();
        setDeleteId(null);
      }
    } catch (err) { console.error(err); }
  };

  // Generate last 12 months for dropdown
  const monthOptions = [];
  let d = new Date();
  for (let i = 0; i < 12; i++) {
    monthOptions.push(`${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`);
    d.setMonth(d.getMonth() - 1);
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', background: 'linear-gradient(to right, #6366f1, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Monthly Fixed Setup
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>Track recurring bills like rent, salary, electricity</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.9rem', borderRadius: '16px' }}>
          + Add Fixed Expense
        </button>
      </div>

      <div className="glass-card" style={{ width: '100%', padding: '0', borderRadius: '32px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Expenses Checklist</h2>
          
          <select 
            value={selectedMonth} 
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setFormData({...formData, monthYear: e.target.value});
            }}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)' }}
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        
        <div className="table-container" style={{ padding: '1rem 2rem 3rem' }}>
          <table>
            <thead>
              <tr style={{ background: 'none' }}>
                <th>Category</th>
                <th>Note</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Paid</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp._id} className="table-row">
                  <td style={{ fontWeight: 800 }}>{exp.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{exp.note || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#f43f5e' }}>${exp.amount} <span style={{fontSize: '0.75rem', color: exp.due > 0 ? '#ea580c' : '#22c55e'}}>(Due: ${exp.due !== undefined ? exp.due : exp.amount})</span></td>
                  <td>
                    <span className={`badge-premium ${exp.status === 'Paid' ? 'paid' : (exp.status === 'Partial' ? 'partial' : 'due')}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{exp.datePaid ? new Date(exp.datePaid).toLocaleDateString() : '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.employee?.name || 'System'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleView(exp)} className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px' }}>View</button>
                      {exp.status !== 'Paid' && (
                        <button onClick={() => handlePayClick(exp)} className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', background: '#22c55e' }}>
                          Pay
                        </button>
                      )}
                      <button onClick={() => handleEdit(exp)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => setDeleteId(exp._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '8rem', color: 'var(--text-muted)' }}>
                    No fixed expenses tracked for {selectedMonth}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setIsEditing(false); setEditId(null); setFormData({ ...formData, amount: "", note: "" }); }} title={isEditing ? "Edit Fixed Expense" : "Track Monthly Fixed Setup"}>
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div className="input-group">
              <label>Target Month</label>
              <select name="monthYear" value={formData.monthYear} onChange={(e)=>setFormData({...formData, monthYear: e.target.value})}>
                 {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
              </select>
            </div>

            <div className="input-group">
              <label>Expense Category</label>
              <select name="category" value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
                <option value="House Rent">House Rent (Basa Vara)</option>
                <option value="Employee Salary">Employee Salary</option>
                <option value="Internet Bill">Internet Bill</option>
                <option value="Electricity Bill">Electricity Bill (Current)</option>
                <option value="Security Bill">Security Bill (Darowan)</option>
                <option value="Other Utility">Other Utility</option>
              </select>
            </div>

            {formData.category === 'Employee Salary' && (
              <div className="input-group">
                <label>Select Employee Name</label>
                <select 
                  onChange={(e) => {
                    const emp = employees.find(emp => emp._id === e.target.value);
                    if (emp) {
                      setFormData({...formData, amount: emp.salary || 0, note: `Salary: ${emp.name}`});
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Choose an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} (Salary: ${emp.salary || 0})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" value={formData.amount} onChange={(e)=>setFormData({...formData, amount: e.target.value})} required placeholder="0.00" />
            </div>

            <div className="input-group">
              <label>Optional Note</label>
              <input type="text" name="note" value={formData.note} onChange={(e)=>setFormData({...formData, note: e.target.value})} placeholder="Any specific details" />
            </div>
            
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: '4rem', fontSize: '1.1rem', fontWeight: 800 }}>
            {isEditing ? "Update Fixed Expense" : "Save Fixed Expense"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`View Expense: ${viewItem?.codeNo || 'N/A'}`}>
        {viewItem && (
          <div>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-glow)' }}>Summary</h3>
              <p><strong>Month:</strong> {viewItem.monthYear}</p>
              <p><strong>Category:</strong> {viewItem.category}</p>
              <p><strong>Total Amount:</strong> ${viewItem.amount}</p>
              <p><strong>Paid:</strong> <span style={{color: '#22c55e'}}>${viewItem.paid || 0}</span></p>
              <p><strong>Due:</strong> <span style={{color: '#ea580c'}}>${viewItem.due !== undefined ? viewItem.due : viewItem.amount}</span></p>
              <p><strong>Status:</strong> {viewItem.status}</p>
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Payment History</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No partial or full payment history found.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount Paid</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                        <span style={{color: '#22c55e'}}>${h.debit}</span>
                      </td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{h.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!payDetail} onClose={() => setPayDetail(null)} title={`Make Payment: ${payDetail?.category}`}>
        {payDetail && (
          <form onSubmit={submitPayment}>
             <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="input-group">
                <label>Amount to Pay ($) - Due: ${payDetail.due !== undefined ? payDetail.due : payDetail.amount}</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required placeholder="0.00" autoFocus />
              </div>
              <div className="input-group">
                <label>Payment Note (Optional)</label>
                <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Paid via bkash, Cash to Darowan..." />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', height: '4rem', fontSize: '1.1rem', fontWeight: 800, background: '#22c55e' }}>
              Confirm Payment
            </button>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Are you sure you want to delete this monthly expense record?</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteId(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
            <button onClick={executeDelete} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#e11d48', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete Item</button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 255, 255, 0.03); transform: scale(1.005); }
        .badge-premium { padding: 0.5rem 1rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; }
        .badge-premium.due { color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); background: rgba(244, 63, 94, 0.1); }
        .badge-premium.partial { color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); background: rgba(234, 179, 8, 0.1); }
        .badge-premium.paid { color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.1); }
      `}</style>
    </MainLayout>
  );
}
