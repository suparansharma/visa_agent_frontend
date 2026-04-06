"use client";
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function PassportPage() {
  const [passports, setPassports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [history, setHistory] = useState([]);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    nid: "",
    previousPassport: "",
    reference: "",
    note: "",
    status: "Processing",
    totalBill: 0,
    paid: 0,
    cost: 0,
  });

  const [previews, setPreviews] = useState({ due: 0, profit: 0 });

  useEffect(() => {
    const due = Number(formData.totalBill) - Number(formData.paid);
    const profit = Number(formData.totalBill) - Number(formData.cost);
    setPreviews({ due, profit });
  }, [formData]);

  const fetchPassports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/passports", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setPassports(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) fetchPassports(); }, [user]);

  const filteredPassports = passports.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.codeNo?.toLowerCase() || "").includes(query) ||
      (p.customerName?.toLowerCase() || "").includes(query) ||
      (p.previousPassport?.toLowerCase() || "").includes(query) ||
      (p.phoneNumber?.toLowerCase() || "").includes(query) ||
      (p.reference?.toLowerCase() || "").includes(query)
    );
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleView = async (p) => {
    setViewItem(p);
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/history/${p.codeNo}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const handleEdit = (p) => {
    setFormData({
      customerName: p.customerName || "",
      phoneNumber: p.phoneNumber || "",
      nid: p.nid || "",
      previousPassport: p.previousPassport || "",
      reference: p.reference || "",
      note: p.note || "",
      status: p.status || "Processing",
      totalBill: p.totalBill || 0,
      paid: p.paid || 0,
      cost: p.cost || 0,
    });
    setEditId(p._id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/passports/${deleteId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchPassports();
        setDeleteId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:5000/api/passports/${editId}` : "http://localhost:5000/api/passports";
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
        fetchPassports();
        setModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ 
          customerName: "", phoneNumber: "", nid: "", previousPassport: "", 
          reference: "", note: "", status: "Processing", totalBill: 0, paid: 0, cost: 0 
        });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', background: 'linear-gradient(to right, #6366f1, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Passport Processing
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>Global records of passport applications and renewals</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.9rem', borderRadius: '16px' }}>
          + Add New Registration
        </button>
      </div>

      <div className="glass-card" style={{ width: '100%', padding: '0', borderRadius: '32px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Historical records list</h2>
          <div className="input-group" style={{ marginBottom: 0, minWidth: '350px' }}>
            <input 
              type="text" 
              placeholder="Search by name, code, passport or phone..." 
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
                <th>Customer Name</th>
                <th>Phone No</th>
                <th>Prev Passport</th>
                <th>Status</th>
                <th>Bill Amount</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPassports.map((p) => (
                <tr key={p._id} className="table-row">
                  <td style={{ fontSize: '0.85rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary-glow)' }}>{p.codeNo}</td>
                  <td>{p.customerName || <span style={{color: 'var(--text-muted)'}}>N/A</span>}</td>
                  <td>{p.phoneNumber || <span style={{color: 'var(--text-muted)'}}>N/A</span>}</td>
                   <td style={{ fontSize: '0.85rem' }}>{p.previousPassport || <span style={{color: 'var(--text-muted)'}}>N/A</span>}</td>
                  <td>
                    <span className={`badge-premium ${p.status === 'Full Complete' ? 'paid' : 'due'}`} style={{ fontSize: '0.75rem', background: !p.status ? 'rgba(255,255,255,0.05)' : '', border: !p.status ? '1px solid var(--glass-border)' : '', color: !p.status ? 'var(--text-muted)' : '' }}>
                      {p.status || 'N/A'}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 600 }}>${p.totalBill}</span></td>
                  <td><span style={{ fontWeight: 600, color: '#22c55e' }}>${p.paid}</span></td>
                  <td><span style={{ fontWeight: 600, color: p.due > 0 ? '#f43f5e' : '#22c55e' }}>${p.due}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.employee?.name || 'System'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleView(p)} className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px' }}>View</button>
                      <button onClick={() => handleEdit(p)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => setDeleteId(p._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPassports.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '8rem', color: 'var(--text-muted)' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setIsEditing(false); setEditId(null); setFormData({ customerName: "", phoneNumber: "", nid: "", previousPassport: "", reference: "", note: "", status: "Processing", totalBill: 0, paid: 0, cost: 0 }); }} title={isEditing ? "Edit Passport Registration" : "New Passport Registration"}>
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="input-group">
              <label>Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required placeholder="Full Name" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="01XXX-XXXXXX" />
            </div>
            <div className="input-group">
              <label>Nid Number</label>
              <input type="text" name="nid" value={formData.nid} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="input-group">
              <label>Previous Passport Number</label>
              <input type="text" name="previousPassport" value={formData.previousPassport} onChange={handleChange} placeholder="Optional" />
            </div>

            <div className="input-group">
              <label>Reference</label>
              <input type="text" name="reference" value={formData.reference} onChange={handleChange} placeholder="Referrer Name/Agency" />
            </div>

            <div className="input-group">
              <label>Current Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Processing">Processing</option>
                <option value="Token Done">Token Done</option>
                <option value="Full Complete">Full Complete</option>
              </select>
            </div>

            <div className="input-group">
              <label>Total Bill Amount ($)</label>
              <input type="number" name="totalBill" value={formData.totalBill} onChange={handleChange} placeholder="0.00" />
            </div>

            <div className="input-group">
              <label>Received Amount ($)</label>
              <input type="number" name="paid" value={formData.paid} onChange={handleChange} placeholder="0.00" />
            </div>

            <div className="input-group">
              <label>Office Expense/Cost ($)</label>
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="0.00" />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Special Note</label>
              <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Any specific notes or details..." style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white', fontSize: '1rem', transition: 'all 0.3s ease', minHeight: '80px', fontFamily: 'inherit' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: '4rem', fontSize: '1.1rem', fontWeight: 800 }}>
            {isEditing ? "Update Registration" : "Submit Registration"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`View Details: ${viewItem?.codeNo}`}>
        {viewItem && (
          <div>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-glow)' }}>Customer Information</h3>
              <p><strong>Name:</strong> {viewItem.customerName}</p>
              <p><strong>Phone:</strong> {viewItem.phoneNumber}</p>
              <p><strong>Prev Passport:</strong> {viewItem.previousPassport}</p>
              <p><strong>Status:</strong> {viewItem.status}</p>
              <p><strong>Total Bill:</strong> ${viewItem.totalBill} | <strong>Total Paid:</strong> ${viewItem.paid} | <strong style={{color: '#f43f5e'}}>Due:</strong> ${viewItem.due}</p>
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Payment & Expense History</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No additional financial records found.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                        {h.credit > 0 ? <span style={{color: '#22c55e'}}>+ ${h.credit}</span> : <span style={{color: '#f43f5e'}}>- ${h.debit}</span>}
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

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Are you sure you want to delete this passport applicant record? This action is permanent and cannot be undone.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteId(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
            <button onClick={executeDelete} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#e11d48', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete Item</button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 255, 255, 0.03); transform: scale(1.005); }
        .badge-premium { padding: 0.5rem 1rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; }
        .badge-premium.due { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); }
        .badge-premium.paid { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .badge-premium.profit { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.2); }
      `}</style>
    </MainLayout>
  );
}
