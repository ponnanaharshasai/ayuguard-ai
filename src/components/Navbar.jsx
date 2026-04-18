import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAdherence } from '../context/AdherenceContext';
import { Globe, Shield, LayoutDashboard, LogIn, UserPlus, LogOut, Bell } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { missedCount } = useAdherence();
  const location = useLocation();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('ayuguard_lang', next);
  };

  // Landing page has its own nav — don't render this one
  if (location.pathname === '/') return null;

  // Auth pages (login/signup) — clean minimal nav
  if (['/login', '/signup'].includes(location.pathname) && !user) {
    return (
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px', padding: '0 2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', textDecoration: 'none' }}>
            <div style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
              <Shield size={20} />
            </div>
            {t('app.name')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={toggleLang} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9375rem' }}>
              <Globe size={18} /> {i18n.language === 'en' ? 'తెలుగు' : 'English'}
            </button>
            <Link to="/login" style={{ color: '#64748b', fontWeight: '700', textDecoration: 'none', fontSize: '0.9375rem' }}>Sign In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none' }}>Join Now</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Dashboard Navbar
  return (
    <nav className="dashboard-nav" style={{ 
      padding: '1.25rem 2rem', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={toggleLang} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.8125rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem' }}>
          <Globe size={16} /> {i18n.language === 'en' ? 'తెలుగు' : 'English'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer', color: '#64748b' }}>
          <Bell size={22} />
          {missedCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', border: '1px solid #f1f5f9', borderRadius: '99px', backgroundColor: '#f8fafc' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.875rem' }}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#1e293b', marginRight: '0.5rem' }}>{user?.full_name?.split(' ')[0]}</span>
          <button 
            onClick={logout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.25rem' }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
