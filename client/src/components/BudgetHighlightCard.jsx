import React from 'react';
import { DollarSign, Map, Calendar, TrendingUp } from 'lucide-react';

export default function BudgetHighlightCard({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
      {/* Total Trips */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Map style={{ width: 24, height: 24, color: '#60a5fa' }} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Trips</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats?.totalTrips || 0}</h3>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Calendar style={{ width: 24, height: 24, color: '#34d399' }} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Upcoming Journeys</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats?.upcomingTrips || 0}</h3>
        </div>
      </div>

      {/* Budget Total Recorded Expenses */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DollarSign style={{ width: 24, height: 24, color: '#fbbf24' }} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Recorded Expenses</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{formatCurrency(stats?.totalSpent)}</h3>
        </div>
      </div>
    </div>
  );
}
