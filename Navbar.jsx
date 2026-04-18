import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Globe, Shield, LayoutDashboard, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('ayuguard_lang', next);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Shield size={20} />
          </div>
          {t('app.name')}
        </Link>

        <div className="navbar-links">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            id="lang-toggle"
            title="Switch language"
          >
            <Globe size={15} />
            {i18n.language === 'en' ? 'తెలుగు' : 'English'}
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  ...(isActive('/dashboard') && { color: 'var(--clr-primary)', background: 'var(--clr-blue-50)' })
                }}
              >
                <LayoutDashboard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {t('nav.dashboard')}
              </Link>

              {/* User avatar chip */}
              <span style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--clr-slate-100)', borderRadius: 'var(--radius-full)',
                padding: '0.375rem 0.875rem',
                fontWeight: 600, fontSize: '0.875rem', color: 'var(--clr-slate-700)',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--clr-blue-500), var(--clr-blue-700))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                }}>
                  {user.full_name?.charAt(0).toUpperCase()}
                </span>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name?.split(' ')[0]}
                </span>
              </span>

              <button
                className="btn btn-sm btn-secondary"
                onClick={logout}
                style={{ minHeight: 44, gap: 6 }}
              >
                <LogOut size={16} />
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={isActive('/login') ? { color: 'var(--clr-primary)', background: 'var(--clr-blue-50)' } : {}}
              >
                <LogIn size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {t('nav.login')}
              </Link>
              <Link
                to="/signup"
                className="btn btn-sm btn-primary"
                style={{ minHeight: 44 }}
                id="nav-signup"
              >
                <UserPlus size={15} />
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
