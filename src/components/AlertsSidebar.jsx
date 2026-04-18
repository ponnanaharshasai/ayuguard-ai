import { useAdherence } from '../context/AdherenceContext';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Clock, CheckCircle, TrendingUp, Bell, Zap } from 'lucide-react';

export default function AlertsSidebar() {
  const { alerts, missedCount } = useAdherence();
  const { user } = useAuth();

  return (
    <aside className="sidebar right-sidebar" style={{ 
      backgroundColor: '#fff', 
      borderLeft: '1px solid #e2e8f0', 
      padding: '1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Insights & Alerts</h2>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="#64748b" />
          {missedCount > 0 && (
            <span style={{ 
              position: 'absolute', top: '-5px', right: '-5px', 
              backgroundColor: '#ef4444', color: '#fff', 
              width: '18px', height: '18px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '10px', fontWeight: 'bold' 
            }}>{missedCount}</span>
          )}
        </div>
      </div>

      {/* Adherence Score Card */}
      <div style={{ 
        padding: '1.25rem', 
        borderRadius: '1.25rem', 
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
        color: '#fff',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.75rem' }}>
            <TrendingUp size={20} />
          </div>
          <span style={{ fontWeight: '600' }}>Adherence Score</span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
          {alerts.length === 0 && missedCount === 0 ? '---' : '100%'}
        </div>
        <p style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
          {alerts.length === 0 ? 'No data yet. Let\'s start tracking!' : 'Excellent consistency!'}
        </p>
      </div>

      {/* Alerts List */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} color="#ef4444" /> Urgent Alerts
        </h3>
        {alerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', gap: '0.75rem' }}>
                <div style={{ marginTop: '2px' }}><AlertCircle size={18} color="#ef4444" /></div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#991b1b' }}>Missed {alert.medicine}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Due at {alert.time} today. Taking it now is recommended.</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #e2e8f0' }}>
            <CheckCircle size={32} color="#10b981" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>All clear! No alerts.</p>
          </div>
        )}

        <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#475569', marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="#3b82f6" /> Today's Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '0.8125rem' }}>Your daily schedule will appear here once you add medications.</p>
        </div>
      </div>

      {/* Proactive Tip */}
      <div style={{ padding: '1rem', borderRadius: '1.25rem', backgroundColor: '#eff6ff', border: '1.5px solid #dbeafe', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Zap size={16} color="#3b82f6" />
          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#1e40af' }}>Getting Started</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.5' }}>
          "Add your first medicine to the left sidebar. I'll automatically start analyzing your adherence and providing insights here."
        </p>
      </div>
    </aside>
  );
}
