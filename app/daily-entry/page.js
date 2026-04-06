"use client";
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function DailyEntryPage() {
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: "Office Expense", // or 'Payment Receive'
    codeNo: "", // For V-XXX or P-XXX if Payment Receive
    targetEmployee: "", // For Advance
    amount: "",
    note: ""
  });

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
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
      fetchTransactions(); 
      fetchEmployees();
    }
  }, [user]);

  const filteredTransactions = transactions.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      (t.codeNo?.toLowerCase() || "").includes(query) ||
      (t.note?.toLowerCase() || "").includes(query) ||
      (t.modelType?.toLowerCase() || "").includes(query)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        fetchTransactions();
        setModalOpen(false);
        setFormData({ type: "Office Expense", codeNo: "", targetEmployee: "", amount: "", note: "" });
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) { console.error(err); }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${deleteId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchTransactions();
        setDeleteId(null);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', background: 'linear-gradient(to right, #6366f1, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Daily Entry
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>Track office expenses and specific received payments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.9rem', borderRadius: '16px' }}>
          + Add New Entry
        </button>
      </div>

      <div className="glass-card" style={{ width: '100%', padding: '0', borderRadius: '32px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Historical Transaction List</h2>
          <div className="input-group" style={{ marginBottom: 0, minWidth: '350px' }}>
            <input 
              type="text" 
              placeholder="Search by code or note..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', color: 'white' }}
            />
          </div>
        </div>
        
        <div className="table-container" style={{ padding: '1rem 2rem 3rem' }}>
          <table>
            <thead>
              <tr style={{ background: 'none' }}>
                <th>Date</th>
                <th>Code No</th>
                <th>Type</th>
                <th>Note</th>
                <th>Debit (Expense)</th>
                <th>Credit (Payment In)</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t._id} className="table-row">
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary-glow)' }}>{t.codeNo}</td>
                  <td>
                    <span className={`badge-premium ${t.modelType === 'Office Expense' ? 'due' : 'paid'}`} style={{ fontSize: '0.75rem', background: t.modelType === 'Office Expense' ? 'rgba(244,63,94,0.1)' : 'rgba(34,197,94,0.1)' }}>
                      {t.modelType}
                    </span>
                  </td>
                  <td>{t.note}</td>
                  <td><span style={{ fontWeight: 600, color: '#f43f5e' }}>{t.debit > 0 ? `$${t.debit}` : '-'}</span></td>
                  <td><span style={{ fontWeight: 600, color: '#22c55e' }}>{t.credit > 0 ? `$${t.credit}` : '-'}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.employee?.name || 'System'}</td>
                  <td>
                    <button onClick={() => setDeleteId(t._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Del</button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '8rem', color: 'var(--text-muted)' }}>
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New Daily Entry">
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div className="input-group">
              <label>Entry Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Payment Receive">Payment Receive (Visa/Passport)</option>
                <option value="Expense (Visa/Passport)">Expense (Visa/Passport)</option>
                <option value="Ticket Income">Ticket Income</option>
                <option value="E-Arrival Income">E-Arrival Income</option>
                <option value="Other Income">Other Income</option>
                <option value="Office Expense">Office Expense</option>
                <option value="Advance Given">Advance Given to Employee (Debit/Khoroc)</option>
                <option value="Advance Returned">Advance Returned by Employee (Credit/Income)</option>
              </select>
            </div>

            {(formData.type === 'Payment Receive' || formData.type === 'Expense (Visa/Passport)') && (
              <div className="input-group">
                <label>Reference Code (Required)</label>
                <input 
                  type="text" 
                  name="codeNo" 
                  value={formData.codeNo} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. V-001 or P-001" 
                />
              </div>
            )}

            {(formData.type === 'Advance Given' || formData.type === 'Advance Returned') && (
              <div className="input-group">
                <label>Select Target Employee</label>
                <select 
                  name="targetEmployee" 
                  value={formData.targetEmployee} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>-- Choose an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="0.00" />
            </div>

            <div className="input-group">
              <label>Special Note / Details</label>
              <textarea 
                name="note" 
                value={formData.note} 
                onChange={handleChange} 
                required 
                placeholder="What is this expense or payment for?" 
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white', fontSize: '1rem', transition: 'all 0.3s ease', minHeight: '80px', fontFamily: 'inherit' }} 
              />
            </div>
            
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: '4rem', fontSize: '1.1rem', fontWeight: 800 }}>
            Submit Entry
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Are you sure you want to delete this ledger entry?</p>
          <p style={{ color: '#eab308', fontSize: '0.9rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <strong>Important:</strong> Deleting a ledger entry will remove it from the general ledger, but it won't automatically revert Visa/Passport paid/cost total values. Proceed with caution.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteId(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
            <button onClick={executeDelete} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#e11d48', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete Entry</button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 255, 255, 0.03); transform: scale(1.005); }
        .badge-premium { padding: 0.5rem 1rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; }
        .badge-premium.due { color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); }
        .badge-premium.paid { color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
      `}</style>
    </MainLayout>
  );
}
