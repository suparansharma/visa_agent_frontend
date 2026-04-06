"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(8px)', 
      zIndex: 2000, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        padding: '2.5rem', 
        position: 'relative',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            fontSize: '1.5rem', 
            cursor: 'pointer' 
          }}
        >&times;</button>
        
        <h2 style={{ marginBottom: '2.5rem', fontSize: '1.75rem', backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {title}
        </h2>
        
        {children}
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
