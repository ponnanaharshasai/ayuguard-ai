import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    password: '', confirm_password: '', age: '',
    preferred_language: 'en',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.password) { setError(t('login.error_required')); return; }
    if (form.password.length < 6) { setError(t('login.error_password')); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signup({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        age: form.age ? parseInt(form.age) : null,
        preferred_language: form.preferred_language,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="signup-page">
      <div className="auth-card">
        {/* Brand */}
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

        <h1 className="auth-title">{t('signup.title')}</h1>
        <p className="auth-subtitle">{t('signup.subtitle')}</p>

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('signup.name_label')} *</label>
              <input className="form-input" value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="Ramesh Kumar" autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('signup.age_label')}</label>
              <input className="form-input" type="number" value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="65" min="1" max="120" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label className="form-label">{t('signup.email_label')} *</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="ramesh@example.com" autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label">{t('signup.phone_label')}</label>
            <input className="form-input" type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+91 98765 43210" />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {[['en', 'English'], ['te', 'తెలుగు']].map(([code, label]) => (
                <button key={code} type="button"
                  onClick={() => set('preferred_language', code)}
                  style={{
                    flex: 1, minHeight: 52, border: `2px solid ${form.preferred_language === code ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                    borderRadius: 'var(--radius-lg)', background: form.preferred_language === code ? 'var(--clr-blue-50)' : 'white',
                    color: form.preferred_language === code ? 'var(--clr-primary)' : 'var(--clr-slate-600)',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{t('signup.password_label')} *</label>
              <button type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}
                onClick={() => setShowPw(p => !p)}>
                {showPw ? <><EyeOff size={14} style={{ verticalAlign: 'middle' }} /> Hide</> : <><Eye size={14} style={{ verticalAlign: 'middle' }} /> Show</>}
              </button>
            </div>
            <input className="form-input" type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label className="form-label">{t('signup.confirm_password_label')} *</label>
            <input className="form-input" type={showPw ? 'text' : 'password'} value={form.confirm_password}
              onChange={e => set('confirm_password', e.target.value)} placeholder="Repeat password" />
            {form.confirm_password && form.password !== form.confirm_password && (
              <p style={{ color: 'var(--clr-danger)', fontSize: '0.8125rem', marginTop: 6, fontWeight: 600 }}>
                Passwords do not match
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}
            disabled={loading || (form.confirm_password && form.password !== form.confirm_password)}
            id="signup-submit">
            {loading ? <div className="spinner" /> : <><UserPlus size={18} /> {t('signup.signup_button')}</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('signup.have_account')}{' '}
            <Link to="/login" id="signup-login-link">{t('signup.login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
