import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Play, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('login.error_required')); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">
        {/* Brand mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--clr-blue-500), var(--clr-blue-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-blue-lg)',
          }}>
            <Shield size={32} color="white" />
          </div>
        </div>

        <h1 className="auth-title">{t('login.title')}</h1>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

        {error && (
          <div style={{
            background: 'var(--clr-danger-bg)', border: '1.5px solid var(--clr-danger-light)',
            borderLeft: '4px solid var(--clr-danger)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
            color: 'var(--clr-danger)', fontWeight: 600, fontSize: 'var(--font-size-sm)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{t('login.email_label')}</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder={t('login.email_placeholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>{t('login.password_label')}</label>
              <button type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}
                onClick={() => setShowPw(p => !p)}
              >
                {showPw ? <><EyeOff size={14} style={{ verticalAlign: 'middle' }} /> Hide</> : <><Eye size={14} style={{ verticalAlign: 'middle' }} /> Show</>}
              </button>
            </div>
            <input
              id="login-password"
              className="form-input"
              type={showPw ? 'text' : 'password'}
              placeholder={t('login.password_placeholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            id="login-submit"
          >
            {loading ? <div className="spinner" /> : <><LogIn size={18} /> {t('login.login_button')}</>}
          </button>
        </form>

        <div className="divider">{t('login.or_continue')}</div>

        <button
          className="btn btn-accent"
          style={{ width: '100%' }}
          onClick={handleDemo}
          id="demo-login-btn"
        >
          <Play size={18} /> Try Demo — No Account Needed
        </button>

        <div className="auth-footer">
          <p>
            {t('login.no_account')}{' '}
            <Link to="/signup" id="login-signup-link">{t('login.signup_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
