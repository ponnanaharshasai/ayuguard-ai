import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pill, Plus, Search, Info } from 'lucide-react';
import PillIcon from './PillIcon';

export default function MedicineSidebar() {
  const { apiFetch, user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/api/medicines');
      setMedicines(data);
    } catch (e) {
      console.error('Failed to fetch medicines', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [user]);

  return (
    <aside className="sidebar left-sidebar" style={{ 
      backgroundColor: '#fff', 
      borderRight: '1px solid #e2e8f0', 
      padding: '1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Medicines</h2>
        <button className="btn btn-sm btn-primary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <Plus size={18} />
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search..." 
          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '0.875rem' }} 
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <p>Loading...</p>
        ) : medicines.length > 0 ? (
          medicines.map(med => (
            <div key={med.id} className="med-card" style={{ 
              padding: '1rem', 
              borderRadius: '1rem', 
              border: '1px solid #f1f5f9', 
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s'
            }}>
              <PillIcon shape={med.pill_shape} color={med.pill_color} size={36} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{med.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{med.dosage} • {med.type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  color: med.stock_count < 10 ? '#ef4444' : '#10b981',
                  backgroundColor: med.stock_count < 10 ? '#fef2f2' : '#f0fdf4',
                  padding: '2px 8px',
                  borderRadius: '99px'
                }}>
                  {med.stock_count} left
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <Pill size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No medicines yet</p>
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1rem', 
        borderRadius: '1rem', 
        backgroundColor: '#eff6ff', 
        border: '1.5px solid #dbeafe',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.4' }}>
          Always consult your doctor before changing dosages.
        </p>
      </div>
    </aside>
  );
}
