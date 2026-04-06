"use client";
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";

export default function ProfitLossPage() {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reports/profit-loss", {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReport();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loader">Loading Financial Data...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', background: 'linear-gradient(to right, #10b981, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          Profit & Loss Report
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>Real-time financial health and cash flow analysis</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* Cash in Hand */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Cash in Hand (Current)</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#10b981' }}>${data?.cashInHand?.toLocaleString()}</p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
             Total Cash actually inside office tray/account
          </div>
        </div>

        {/* Realized Profit */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Current Net Profit</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#3b82f6' }}>${data?.realizedProfit?.toLocaleString()}</p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
             Income - Expenses (Current Balance)
          </div>
        </div>

        {/* Customer Dues */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(244, 63, 94, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Customer Market Dues</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#f43f5e' }}>${data?.customerDues?.toLocaleString()}</p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
             Money you are yet to receive from clients
          </div>
        </div>

         {/* Expected Final Profit */}
         <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(168, 85, 247, 0.2)', position: 'relative', overflow: 'hidden', gridColumn: 'span 1' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Expected Profit</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#a855f7' }}>${data?.expectedProfit?.toLocaleString()}</p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
             Profit if all customers pay their full dues
          </div>
        </div>

      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
        
        {/* Income Breakdown */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Income Sources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Visa Payments</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.visaPaid?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Passport Payments</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.ppPaid?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Other (Tickets, etc.)</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.otherIncome?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Total Realized Income</span>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#10b981' }}>${data?.breakdown?.totalIncome?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Expense Categories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Visa Processing Costs</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.visaCost?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Passport Costs</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.ppCost?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Office & Monthly Bills</span>
              <span style={{ fontWeight: 'bold' }}>${data?.breakdown?.officeExpense?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>Total Realized Expenses</span>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#f43f5e' }}>${data?.breakdown?.totalExpense?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <p style={{ margin: 0, color: '#eab308', fontWeight: 600 }}>
            Note: Employee Advances of <span style={{fontSize: '1.2rem'}}>${data?.employeeAdvances?.toLocaleString()}</span> are currently out of the office fund. 
            Once they return the money, it will reflect back in Cash in Hand.
          </p>
      </div>

    </MainLayout>
  );
}
