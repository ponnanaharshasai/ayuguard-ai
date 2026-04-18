import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAdherence } from '../context/AdherenceContext';
import { 
  Activity, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight,
  Plus
} from 'lucide-react';
import ChatView from '../components/ChatView';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, apiFetch } = useAuth();
  const { alerts, refresh } = useAdherence();
  const [activeTab, setActiveTab] = useState('assistant');
  const [vitals, setVitals] = useState({
    bp: '120/80',
    sugar: '110 mg/dL',
    pulse: '72 bpm',
    weight: '68 kg'
  });

  const stats = [
    { label: 'Blood Pressure', value: vitals.bp, icon: <Heart size={18} color="#ef4444" />, trend: 'Stable' },
    { label: 'Blood Sugar', value: vitals.sugar, icon: <Activity size={18} color="#f59e0b" />, trend: 'Normal' },
    { label: 'Pulse Rate', value: vitals.pulse, icon: <Heart size={18} color="#3b82f6" />, trend: 'Good' },
  ];

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header with Welcome and quick actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>
            {t('dashboard.welcome')}, <span style={{ color: '#3b82f6' }}>{user?.full_name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
            It's a beautiful {new Date().toLocaleDateString('en-US', { weekday: 'long' })}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.75rem', padding: '0.75rem 1.25rem' }}>
            <Plus size={20} /> Record Vitals
          </button>
        </div>
      </div>

      {/* Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ 
            padding: '1.25rem', 
            borderRadius: '1.25rem', 
            backgroundColor: '#fff', 
            border: '1.5px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '0.75rem' }}>{stat.icon}</div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', backgroundColor: '#f0fdf4', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>
                {stat.trend}
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs Container */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '1.5rem', 
        border: '1.5px solid #f1f5f9',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px'
      }}>
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: '#f8fafc', 
          display: 'flex', 
          gap: '0.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {[
            { key: 'assistant', label: t('dashboard.ai_assistant'), icon: <Sparkles size={18} /> },
            { key: 'schedule', label: t('dashboard.schedule'), icon: <Calendar size={18} /> },
            { key: 'reports', label: t('dashboard.reports'), icon: <Activity size={18} /> },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#3b82f6' : '#64748b',
                fontWeight: '700',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: activeTab === tab.key ? '0 1px 3px 0 rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {activeTab === 'assistant' && (
            <ChatView vitals={vitals} />
          )}
          
          {activeTab === 'schedule' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Today's Timeline</h2>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: '700', color: '#64748b' }}>
                  <CheckCircle2 size={16} color="#10b981" /> 2 Completed
                  <Clock size={16} color="#3b82f6" /> 1 Remaining
                </div>
              </div>
              
              {/* Timeline implementation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { time: '08:00 AM', name: 'Metformin', dosage: '500mg', status: 'missed', icon: 'tablet' },
                  { time: '09:30 AM', name: 'Amlodipine', dosage: '5mg', status: 'taken', icon: 'capsule' },
                  { time: '01:00 PM', name: 'Paracetamol', dosage: '650mg', status: 'pending', icon: 'tablet' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ minWidth: '80px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700', color: '#64748b', paddingTop: '1rem' }}>
                      {item.time}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      padding: '1.25rem', 
                      borderRadius: '1.25rem', 
                      backgroundColor: item.status === 'taken' ? '#f0fdf4' : item.status === 'missed' ? '#fef2f2' : '#f8fafc',
                      border: '1.5px solid',
                      borderColor: item.status === 'taken' ? '#bbf7d0' : item.status === 'missed' ? '#fecaca' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '0.75rem', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: item.status === 'taken' ? '#10b981' : item.status === 'missed' ? '#ef4444' : '#3b82f6',
                          color: '#fff'
                        }}>
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{item.name}</h4>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.dosage} • Before Lunch</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {item.status === 'taken' ? (
                          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#10b981' }}>Taken ✅</span>
                        ) : item.status === 'missed' ? (
                          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#ef4444' }}>Missed ❌</span>
                        ) : (
                          <button className="btn btn-sm btn-primary">Take Now <ChevronRight size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Weekly Adherence Report</h3>
              <p>Your medicine intake consistency is improving. You've hit 92% adherence this week!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
