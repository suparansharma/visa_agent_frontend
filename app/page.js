"use client";
import { useState, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import { useAuth } from "./context/AuthContext";

export default function Dashboard() {
  const [visas, setVisas] = useState([]);
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalVisas: 0, 
    totalPassports: 0, 
    totalIncome: 0, 
    totalExpense: 0,
    netBalance: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  return (
    <MainLayout>
      <header style={{ marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-3px', background: 'linear-gradient(to right, #6366f1, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          Business Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 500 }}>Real-time statistics for Visa Processing & Employees</p>
      </header>

      <div className="stats-grid" style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
        <StatCard label="Total Visas" value={stats.totalVisas} icon="✈️" color="#6366f1" />
        <StatCard label="Total Passports" value={stats.totalPassports} icon="🛂" color="#a855f7" />
        <StatCard label="Ledger Income" value={`$${stats.totalIncome}`} icon="💰" color="#22c55e" />
        <StatCard label="Ledger Expense" value={`$${stats.totalExpense}`} icon="📉" color="#f43f5e" />
        <StatCard label="Net Balance" value={`$${stats.netBalance}`} icon="🏛️" color="#22d3ee" />
      </div>

      <div className="glass-card" style={{ width: '100%', padding: '4rem', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Active Management Modules</h2>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
           <ModuleCard 
             title="Visa Lifecycle" 
             desc="Monitor, register, and calculate finances for every visa application in your system." 
             href="/visas" 
           />
           <ModuleCard 
             title="Passport Renewals" 
             desc="Track and process customer passport applications securely." 
             href="/passports" 
           />
           <ModuleCard 
             title="Daily Ledger" 
             desc="Manage daily cash flow, record payments, and track office expenses." 
             href="/daily-entry" 
           />
           <ModuleCard 
             title="Monthly Fixed Setup" 
             desc="Manage recurring office expenses like rent, salary, and utility bills seamlessly." 
             href="/monthly-expenses" 
           />
           {user?.role === 'admin' && (
             <ModuleCard 
               title="Personnel Control" 
               desc="Administer employee accounts, roles, and operational permissions." 
               href="/employees" 
             />
           )}
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '32px', textAlign: 'center', transition: 'all 0.3s' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '1rem', color }}>{value}</div>
    </div>
  );
}

function ModuleCard({ title, desc, href }) {
  return (
    <div style={{ padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '24px', background: 'rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => window.location.href = href}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{desc}</p>
      <div style={{ marginTop: '2rem', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Explore Module &rarr;</div>
    </div>
  );
}
