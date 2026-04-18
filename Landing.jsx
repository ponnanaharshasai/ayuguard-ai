import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Bell, Flame, AlertTriangle, Bot, BarChart3, Users,
  Volume2, MessageCircle, ShieldCheck, Zap, Heart
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: <Bell size={28} />, title: t('landing.feature_reminders_title'), desc: t('landing.feature_reminders_desc'), color: '#EFF8FF', accent: '#0C96E8' },
    { icon: <Flame size={28} />, title: t('landing.feature_streaks_title'), desc: t('landing.feature_streaks_desc'), color: '#FFF7ED', accent: '#EA580C' },
    { icon: <AlertTriangle size={28} />, title: t('landing.feature_alerts_title'), desc: t('landing.feature_alerts_desc'), color: '#FEF2F2', accent: '#DC2626' },
    { icon: <Bot size={28} />, title: t('landing.feature_ai_title'), desc: t('landing.feature_ai_desc'), color: '#F0FDF4', accent: '#059669' },
    { icon: <Volume2 size={28} />, title: t('landing.feature_voice_title'), desc: t('landing.feature_voice_desc'), color: '#FDF4FF', accent: '#9333EA' },
    { icon: <MessageCircle size={28} />, title: t('landing.feature_whatsapp_title'), desc: t('landing.feature_whatsapp_desc'), color: '#F0FDF4', accent: '#16A34A' },
    { icon: <BarChart3 size={28} />, title: t('landing.feature_reports_title'), desc: t('landing.feature_reports_desc'), color: '#EFF8FF', accent: '#0C96E8' },
    { icon: <Users size={28} />, title: t('landing.feature_family_title'), desc: t('landing.feature_family_desc'), color: '#FFF7ED', accent: '#D97706' },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '98%', label: 'Adherence Rate' },
    { value: '24/7', label: 'AI Support' },
    { value: '2', label: 'Languages' },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="container">
          {/* Trust badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--clr-blue-50)', border: '1.5px solid var(--clr-blue-200)',
              borderRadius: '999px', padding: '0.375rem 1rem',
              color: 'var(--clr-blue-600)', fontWeight: 700, fontSize: '0.875rem'
            }}>
              <ShieldCheck size={16} /> Trusted by Elderly Patients Across India
            </span>
          </div>

          <h1 className="hero-title" style={{ maxWidth: '800px', margin: '0 auto 1.25rem' }}>
            <span className="highlight">Never Miss</span> a Dose Again
          </h1>

          <p className="hero-subtitle">
            {t('landing.hero_subtitle')}
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary" id="hero-cta" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              <Zap size={20} /> {t('landing.get_started')}
            </Link>
            <a href="#features" className="btn btn-outline" id="hero-learn">
              {t('landing.learn_more')}
            </a>
          </div>

          {/* Stats bar */}
          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div className="hero-stat" key={i}>
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof banner */}
      <div style={{
        background: 'var(--clr-blue-600)',
        color: 'white',
        padding: '0.875rem 0',
        textAlign: 'center',
        fontSize: '0.9375rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}>
        <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
        Designed with love for India's elderly — available in English & Telugu
      </div>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">{t('landing.features_title')}</h2>
          <p className="section-subtitle">{t('landing.features_subtitle')}</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i} id={`feature-card-${i}`}>
                <div className="feature-icon" style={{ background: f.color, color: f.accent }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'var(--space-3xl) 0', background: 'var(--clr-bg)' }}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '3rem' }}>How AyuGuard Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {[
              { step: '01', title: 'Add Your Medicines', desc: 'Enter your medicines, dosage, and schedule in seconds.' },
              { step: '02', title: 'Get Reminders', desc: 'Receive voice and WhatsApp alerts before each dose time.' },
              { step: '03', title: 'Track Progress', desc: 'Mark doses taken and watch your adherence streak grow.' },
              { step: '04', title: 'Stay Safe', desc: 'Guardian is auto-alerted if you miss a dose beyond 30 minutes.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)',
                border: '1.5px solid var(--clr-border-light)', boxShadow: 'var(--shadow-sm)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 400,
                  color: 'var(--clr-blue-100)', position: 'absolute', top: '-8px', right: '16px',
                  lineHeight: 1, userSelect: 'none'
                }}>{item.step}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-slate-900)', marginBottom: '0.5rem' }}>{item.title}</div>
                <div style={{ color: 'var(--clr-slate-500)', fontSize: '0.9375rem' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta-section">
        <h2>{t('landing.cta_title')}</h2>
        <p>{t('landing.cta_subtitle')}</p>
        <Link to="/signup" className="btn" id="cta-signup" style={{ fontSize: '1.1rem' }}>
          <Zap size={20} /> {t('landing.cta_button')}
        </Link>
        <p className="footer">{t('landing.footer_text')}</p>
      </section>
    </main>
  );
}
