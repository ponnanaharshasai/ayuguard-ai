import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Play, Shield, Eye, EyeOff, Zap } from 'lucide-react';

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

  return (
    <div className="auth-page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div className="auth-card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '2.5rem', 
        backgroundColor: '#fff', 
        borderRadius: '2rem', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '1.25rem', color: '#3b82f6' }}>
            <Shield size={40} />
          </div>
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>Account Login</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>Welcome back to AyuGuard AI.</p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setShowPw(!showPw)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '700', fontSize: '0.8125rem', cursor: 'pointer' }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <input 
              type={showPw ? 'text' : 'password'} 
              className="form-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'Logging in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9375rem', color: '#64748b' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#3b82f6', fontWeight: '700' }}>Sign up now</Link>
        </div>
      </div>
    </div>
  );
}
