"use client";
import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewHistoryUserId, setViewHistoryUserId] = useState(null);
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "administrative", salary: "" });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { 'Authorization': `Bearer ${currentUser?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (currentUser) fetchUsers(); }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:5000/api/users/${editId}` : "http://localhost:5000/api/auth/register";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchUsers();
        setModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: "", email: "", password: "", role: "administrative", salary: "" });
      } else {
        const errorData = await res.json();
        alert(errorData.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleEdit = (u) => {
    setFormData({
      name: u.name,
      email: u.email,
      password: "", // Exclude password from prepopulating for security/simplicity
      role: u.role,
      salary: u.salary || 0
    });
    setEditId(u._id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${deleteId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${currentUser?.token}` }
      });
      if (res.ok) {
        fetchUsers();
        setDeleteId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleViewAdvanceHistory = async (userId) => {
    setViewHistoryUserId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/advance/${userId}`, {
        headers: { 'Authorization': `Bearer ${currentUser?.token}` }
      });
      const data = await res.json();
      setAdvanceHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', background: 'linear-gradient(to right, #6366f1, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Employee Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>Global staff directories and role assignments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.9rem', borderRadius: '16px' }}>
          + Add New Staff Member
        </button>
      </div>

      <div className="glass-card" style={{ width: '100%', padding: '0', borderRadius: '32px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Current Active Personnel</h2>
        </div>
        
        <div className="table-container" style={{ padding: '1rem 2rem 3rem' }}>
          <table>
            <thead>
              <tr style={{ background: 'none' }}>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Full Name</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Email Address</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Role</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Salary</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#ea580c' }}>Advance Dues</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Joined Date</th>
                <th style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="table-row">
                  <td style={{ fontWeight: 800 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge-premium" style={{ 
                      background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                      color: u.role === 'admin' ? '#ec4899' : '#6366f1',
                      border: u.role === 'admin' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
                    }}>{u.role} Account</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#22c55e' }}>{u.salary > 0 ? `$${u.salary}` : '-'}</td>
                  <td>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        color: u.advanceTaken > 0 ? '#ea580c' : 'var(--text-muted)',
                        cursor: 'pointer',
                        borderBottom: u.advanceTaken > 0 ? '1px dashed #ea580c' : 'none'
                      }}
                      onClick={() => { if(u.advanceTaken > 0) handleViewAdvanceHistory(u._id); }}
                    >
                      {u.advanceTaken > 0 ? `$${u.advanceTaken}` : '-'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleEdit(u)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Edit</button>
                      {u.email !== 'admin@visa.com' && (
                        <button onClick={() => setDeleteId(u._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setIsEditing(false); setEditId(null); setFormData({ name: "", email: "", password: "", role: "administrative", salary: "" }); }} title={isEditing ? "Edit Personnel Profile" : "Register New Staff Member"}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Legal Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. John Doe" />
          </div>
          <div className="input-group">
            <label>Work Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="e.g. john@visa.com" />
          </div>
          <div className="input-group">
            <label>Initialize System Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!isEditing} placeholder={isEditing ? "Leave blank to keep unchanged" : ""} />
          </div>
          <div className="input-group">
            <label>Monthly Salary ($)</label>
            <input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} required placeholder="0.00" />
          </div>
          <div className="input-group">
            <label>Assign Account Role</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="administrative">Administrative</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '4rem', marginTop: '2rem', borderRadius: '16px', fontWeight: 800 }}>
            {isEditing ? "Update Personnel" : "Confirm Registration"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Are you sure you want to delete this staff member? Their access will immediately be revoked. This cannot be undone.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteId(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
            <button onClick={executeDelete} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#e11d48', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete Staff</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewHistoryUserId} onClose={() => setViewHistoryUserId(null)} title="Advance History">
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>History Records</h3>
          {advanceHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No advance history found for this staff member.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {advanceHistory.map(h => (
                  <tr key={h._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: h.modelType === 'Advance Given' ? '#f43f5e' : '#22c55e' }}>
                      {h.modelType}
                    </td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                      ${h.modelType === 'Advance Given' ? h.debit : h.credit}
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .table-row:hover { background: rgba(255, 255, 255, 0.03); transform: scale(1.005); }
        .badge-premium { padding: 0.5rem 1rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; }
      `}</style>
    </MainLayout>
  );
}
