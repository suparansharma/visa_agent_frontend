"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div style={{ 
      width: '280px', 
      height: '100vh', 
      position: 'fixed', 
      top: 0,
      left: 0,
      background: 'rgba(255, 255, 255, 0.04)',
      borderRight: '1px solid var(--glass-border)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '3rem 2rem',
      zIndex: 1000
    }}>
      <div>
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px' }} />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--accent)', letterSpacing: '2px', fontWeight: 900 }}>VISA APP</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SidebarLink href="/" label="Dashboard" icon="📊" />
          <SidebarLink href="/daily-entry" label="Daily Entry" icon="💵" />
          <SidebarLink href="/monthly-expenses" label="Monthly Fixed" icon="📅" />
          <SidebarLink href="/visas" label="Visa Module" icon="✈️" />
          <SidebarLink href="/passports" label="Passport Module" icon="🛂" />
          {user?.role === 'admin' && (
            <>
              <SidebarLink href="/employees" label="Employees" icon="👥" />
              <SidebarLink href="/profit-loss" label="Profit & Loss" icon="📈" />
            </>
          )}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-primary" style={{ width: '100%', background: 'linear-gradient(to right, #f43f5e, #e11d48)', fontSize: '0.85rem', padding: '0.75rem', borderRadius: '14px' }}>Logout</button>
      </div>

      <style jsx global>{`
        .sidebar-link-item {
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
        }
        .sidebar-link-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding-left: 2rem;
        }
      `}</style>
    </div>
  );
}

function SidebarLink({ href, label, icon }) {
  return (
    <Link href={href} className="sidebar-link-item">
      <span>{icon}</span> {label}
    </Link>
  );
}
