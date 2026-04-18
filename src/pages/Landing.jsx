import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Bell, 
  Bot, 
  Languages, 
  ClipboardList, 
  Users,
  Search,
  Check,
  AlertCircle,
  Clock,
  Heart,
  Droplets,
  Flame,
  Scale,
  Menu,
  X
} from 'lucide-react';
import '../styles/landing.css';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.feature-card, .vital-card, .stat-item, .proof-card');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="landing-nav" id="landing-nav">
        <div className="nav-logo">
          <div className="logo-mark"></div>
          <span className="logo-text">Ayu<span>Guard</span> AI</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links" style={mobileMenuOpen ? {
          display: 'flex', flexDirection: 'column', position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6,8,15,0.95)', backdropFilter: 'blur(20px)',
          justifyContent: 'center', alignItems: 'center', gap: '32px',
          zIndex: 200, padding: '24px'
        } : {}}>
          {mobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>
              <X size={28} />
            </button>
          )}
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#vitals" onClick={() => setMobileMenuOpen(false)}>Vitals</a>
          <a href="#languages" onClick={() => setMobileMenuOpen(false)}>Languages</a>
          <a href="#dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</a>
          <Link to="/signup" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>Try Free →</Link>
        </div>

        {/* Mobile toggle */}
        <button className="nav-toggle" onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          <span className="ticker-item">🏥 Trusted by 50,000+ families</span><span className="ticker-dot">·</span>
          <span className="ticker-item">Telugu & English voice support</span><span className="ticker-dot">·</span>
          <span className="ticker-item">Real-time medication alerts</span><span className="ticker-dot">·</span>
          <span className="ticker-item">AI-powered health insights</span><span className="ticker-dot">·</span>
          <span className="ticker-item">92% average adherence score</span><span className="ticker-dot">·</span>
          <span className="ticker-item">Blood pressure · Sugar · Pulse · Weight</span><span className="ticker-dot">·</span>
          <span className="ticker-item">🏥 Trusted by 50,000+ families</span><span className="ticker-dot">·</span>
          <span className="ticker-item">Telugu & English voice support</span><span className="ticker-dot">·</span>
          <span className="ticker-item">Real-time medication alerts</span><span className="ticker-dot">·</span>
          <span className="ticker-item">AI-powered health insights</span><span className="ticker-dot">·</span>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-grid-bg"></div>
          <div className="hero-orb orb1"></div>
          <div className="hero-orb orb2"></div>
          <div className="hero-orb orb3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            <span>Advanced AI Medical Companion</span>
          </div>
          <h1 className="hero-headline">
            <strong>Health care</strong> that<br />
            <em>thinks ahead,</em><br />
            so you never fall behind.
          </h1>
          <p className="hero-sub">Proactive · Multilingual · Always watchful</p>
          <p className="hero-desc">
            AyuGuard AI is the world's first bilingual elderly health companion. 
            Manage medicines, track vitals, and get proactive health insights — all through natural voice commands.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
            <a href="#dashboard" className="btn-secondary">Watch Demo</a>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><CheckCircle2 size={16} color="var(--ld-accent)" /> HIPAA-aligned</div>
            <div className="trust-divider"></div>
            <div className="trust-item"><CheckCircle2 size={16} color="var(--ld-accent)" /> No credit card required</div>
            <div className="trust-divider"></div>
            <div className="trust-item"><CheckCircle2 size={16} color="var(--ld-accent)" /> Telugu & English</div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">50<span>K+</span></div>
            <div className="stat-label">Active Families</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">92<span>%</span></div>
            <div className="stat-label">Adherence Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">2<span>M+</span></div>
            <div className="stat-label">Doses Tracked</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">4.9<span>★</span></div>
            <div className="stat-label">User Rating</div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ───────────────────────────────────────────── */}
      <section className="dashboard-section" id="dashboard">
        <p className="section-label">Product Preview</p>
        <h2 className="section-title">Your complete health<br />dashboard, <em>at a glance</em></h2>
        <p className="section-desc">Three intelligent panels — always in sync. Never miss a dose, a trend, or an insight.</p>

        <div className="dashboard-mock">
          <div className="mock-titlebar">
            <div className="traffic t-red"></div>
            <div className="traffic t-amber"></div>
            <div className="traffic t-green"></div>
            <div className="mock-url">app.ayuguard.ai/dashboard</div>
          </div>
          <div className="mock-body">
            {/* LEFT: Medicines */}
            <div className="mock-col">
              <div className="mock-col-title">Medicines (6)</div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--ld-text-muted)' }} />
                  <input style={{ width: '100%', padding: '7px 10px 7px 32px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: 'var(--ld-text-dim)', background: 'rgba(255,255,255,0.03)' }} placeholder="Search medicines..." readOnly />
                </div>
              </div>
              <div className="med-item">
                <div className="med-pill" style={{ background: 'rgba(34,211,167,0.12)', color: 'var(--ld-accent)' }}><ClipboardList size={18} /></div>
                <div className="med-info"><div className="med-name">Metformin 500mg</div><div className="med-dose">Twice daily · Post meal</div></div>
                <div className="med-stock">28 left</div>
              </div>
              <div className="med-item">
                <div className="med-pill" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--ld-cyan)' }}><ClipboardList size={18} /></div>
                <div className="med-info"><div className="med-name">Amlodipine 5mg</div><div className="med-dose">Once · Morning</div></div>
                <div className="med-stock">14 left</div>
              </div>
              <div className="med-item">
                <div className="med-pill" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><ClipboardList size={18} /></div>
                <div className="med-info"><div className="med-name">Atorvastatin 20mg</div><div className="med-dose">Once · Night</div></div>
                <div className="med-stock stock-low">4 left ⚠</div>
              </div>
            </div>

            {/* CENTER: Chat + Timeline */}
            <div className="mock-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div className="mock-col-title">AI Companion</div>
                <div className="ai-chat-area">
                  <div className="chat-header">
                    <div className="ai-avatar"><Bot size={16} color="white" /></div>
                    <div><div className="ai-name">AyuGuard</div><div className="ai-status">● Active · Monitoring</div></div>
                  </div>
                  <div className="chat-messages">
                    <div className="msg msg-ai">Good morning! Your 8 AM Metformin is due in 15 minutes. Also, your blood pressure reading was stable yesterday. Keep it up!</div>
                    <div className="msg msg-user">Okay, thank you AyuGuard.</div>
                    <div className="msg msg-ai">You've consistently taken your medications — <strong>you're at 94% adherence</strong> this week. Excellent! 🎉</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mock-col-title">Today's Timeline</div>
                <div className="timeline-wrap">
                  <div className="tl-item">
                    <div className="tl-dot tl-taken"><Check size={16} /></div>
                    <div className="tl-info"><div className="tl-name">Metformin 500mg</div><div className="tl-time">6:30 AM · Taken</div></div>
                  </div>
                  <div className="tl-item">
                    <div className="tl-dot tl-missed">!</div>
                    <div className="tl-info"><div className="tl-name">Amlodipine 5mg</div><div className="tl-time">9:00 AM · MISSED</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Alerts */}
            <div className="mock-col">
              <div className="mock-col-title">Alerts & Insights</div>
              <div className="alert-card alert-high">
                <div className="alert-label">⚠ Missed Dose</div>
                <div className="alert-text">Amlodipine 5mg was missed. Take now or notify caregiver.</div>
              </div>
              <div className="alert-card alert-info">
                <div className="alert-label">💡 AI Insight</div>
                <div className="alert-text">Consistent habits identified. Shifting schedule to 8 AM may improve stability.</div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div className="mock-col-title">Adherence Score</div>
                <div className="adherence-ring">
                  <svg viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke="var(--ld-accent)" strokeWidth="7" strokeDasharray="219 239" strokeDashoffset="60" strokeLinecap="round" transform="rotate(-90 45 45)" />
                  </svg>
                  <div className="adherence-val">92%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <p className="section-label">Core Features</p>
        <h2 className="section-title">Everything an elderly patient<br />and their family <em>needs</em></h2>
        <p className="section-desc">Designed with love for those who need a reliable, always-present health companion.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Bot size={24} /></div>
            <h3 className="feature-title">AI Medical Reasoning</h3>
            <p className="feature-desc">Ask anything — drug interactions, dosage clarifications, symptom checks. Powered by contextual medical AI.</p>
            <span className="feature-tag">Natural Language</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bell size={24} /></div>
            <h3 className="feature-title">Proactive Interventions</h3>
            <p className="feature-desc">Detects patterns, sends alerts, and nudges users before a missed dose becomes a health event.</p>
            <span className="feature-tag">Pattern Analysis</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Languages size={24} /></div>
            <h3 className="feature-title">Voice in Telugu & English</h3>
            <p className="feature-desc">Full speech-to-text and text-to-speech in natural Telugu. No typing required — just speak naturally.</p>
            <span className="feature-tag">Bilingual Voice AI</span>
          </div>
        </div>
      </section>

      {/* ── VITALS ──────────────────────────────────────────────────────── */}
      <section className="vitals-section" id="vitals">
        <div className="vitals-inner">
          <div style={{ marginBottom: '48px' }}>
            <p className="section-label">Vitals Monitoring</p>
            <h2 className="section-title">Your body, in <em>numbers</em></h2>
            <p className="section-desc">Four critical health markers, tracked continuously. Visualize trends. Share with your physician.</p>
          </div>
          <div className="vitals-cards">
            <div className="vital-card">
              <div className="vital-icon"><Activity size={28} /></div>
              <div className="vital-name">Blood Pressure</div>
              <div className="vital-val">118<span style={{ fontSize: '20px', color: 'var(--ld-text-dim)' }}>/76</span></div>
              <div className="vital-unit">mmHg</div>
            </div>
            <div className="vital-card">
              <div className="vital-icon"><Droplets size={28} /></div>
              <div className="vital-name">Blood Sugar</div>
              <div className="vital-val">142</div>
              <div className="vital-unit">mg/dL · fasting</div>
            </div>
            <div className="vital-card">
              <div className="vital-icon"><Heart size={28} /></div>
              <div className="vital-name">Pulse Rate</div>
              <div className="vital-val">72</div>
              <div className="vital-unit">bpm · resting</div>
            </div>
            <div className="vital-card">
              <div className="vital-icon"><Scale size={28} /></div>
              <div className="vital-name">Weight</div>
              <div className="vital-val">68.4</div>
              <div className="vital-unit">kg · this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ───────────────────────────────────────────────────── */}
      <section className="lang-section" id="languages">
        <div className="lang-inner">
          <div className="lang-demo">
            <div className="lang-messages">
              <div className="msg msg-ai" style={{ fontSize: '14px', fontFamily: '"Noto Sans Telugu", sans-serif' }}>నమస్కారం! మీ ఉదయం మందులు తీసుకోవాల్సిన సమయం వచ్చింది. మీరు నేడు ఎలా అనిపిస్తున్నారు?</div>
              <div className="msg msg-user" style={{ fontSize: '14px', fontFamily: '"Noto Sans Telugu", sans-serif' }}>నా తల నొప్పిగా ఉంది</div>
              <div className="msg msg-ai" style={{ fontSize: '14px' }}>I understand. This might be due to the missed BP medication. Should I notify your son?</div>
            </div>
          </div>
          <div className="lang-text">
            <h3>Built for <em>real voices,</em><br />real people</h3>
            <p>AyuGuard understands the way elderly Indian users actually speak — mixing Telugu and English naturally. No language barrier anymore.</p>
            <div className="lang-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <span className="lang-pill">Telugu STT</span>
              <span className="lang-pill">English STT</span>
              <span className="lang-pill">Code-switching</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">Ayu<span>Guard</span> AI</div>
        <div className="footer-copy">© 2025 AyuGuard. Made with care in India 🇮🇳</div>
        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
