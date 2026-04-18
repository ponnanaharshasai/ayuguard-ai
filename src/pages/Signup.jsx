import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
    if (!form.full_name || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
    <div className="auth-page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div className="auth-card" style={{ 
        width: '100%', 
        maxWidth: '520px', 
        padding: '2.5rem', 
        backgroundColor: '#fff', 
        borderRadius: '2rem', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '1.25rem', color: '#3b82f6' }}>
            <Shield size={40} />
          </div>
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>Join AyuGuard AI to manage your health smarter.</p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="Ramesh Kumar" />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="65" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="ramesh@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[['en', 'English'], ['te', 'తెలుగు']].map(([code, label]) => (
                <button key={code} type="button"
                  onClick={() => set('preferred_language', code)}
                  style={{
                    flex: 1, minHeight: 48, border: `2.5px solid ${form.preferred_language === code ? '#3b82f6' : '#f1f5f9'}`,
                    borderRadius: '1rem', background: form.preferred_language === code ? '#eff6ff' : 'white',
                    color: form.preferred_language === code ? '#3b82f6' : '#64748b',
                    fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}>
                  {form.preferred_language === code && <CheckCircle size={16} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-input" type={showPw ? 'text' : 'password'} value={form.confirm_password}
                onChange={e => set('confirm_password', e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9375rem', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: '700' }}>Sign in now</Link>
        </div>
      </div>
    </div>
  );
}
