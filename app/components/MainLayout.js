"use client";
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: 'var(--bg-gradient)' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', position: 'relative' }}>
      {/* Sidebar - True Fixed Side */}
      <Sidebar />
      
      {/* Main Content Area - Full width with offset */}
      <main style={{ 
        padding: '3rem 4rem',
        minHeight: '100vh',
        boxSizing: 'border-box',
        marginLeft: '280px', // Matches Sidebar width
        width: 'calc(100% - 280px)',
      }}>
        {children}
      </main>

      <style jsx global>{`
        body { margin: 0; padding: 0; overflow-x: hidden; }
      `}</style>
    </div>
  );
}
