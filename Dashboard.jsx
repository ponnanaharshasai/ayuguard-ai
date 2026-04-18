import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  Pill, Flame, AlertTriangle, Plus, Check, X,
  Send, Bot, BarChart3, Clock, Package, TrendingUp,
  Volume2, VolumeX, Trophy, Zap, Download, Activity,
  Pencil, Trash2, RefreshCw,
} from 'lucide-react';
import PillIcon from '../components/PillIcon';

/* ═══════════════════════════════════════════════════════════════════════════
   VOICE — Telugu/English Speech Synthesis
   ═══════════════════════════════════════════════════════════════════════════ */
function speakText(text, lang = 'te-IN') {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.82;
  utt.pitch = 1;
  utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
  if (match) utt.voice = match;
  window.speechSynthesis.speak(utt);
}

function useVoice() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('ayuguard_voice') === 'true');

  const speak = useCallback((text, lang) => {
    if (!enabled) return;
    speakText(text, lang);
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem('ayuguard_voice', String(next));
      if (next) speakText('వాయిస్ సహాయం ప్రారంభించబడింది');
      return next;
    });
  }, []);

  return { enabled, speak, toggle };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, apiFetch, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const voice = useVoice();

  const [medicines, setMedicines] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [adherence, setAdherence] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [toast, setToast] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchAll();
  }, [user, authLoading]);

  useEffect(() => {
    if (lowStock.length > 0 && voice.enabled) {
      const names = lowStock.map(a => a.medicine_name).join(', ');
      const msg = i18n.language === 'te'
        ? `${names} మందుల స్టాక్ తక్కువగా ఉంది. దయచేసి రీఫిల్ చేయండి.`
        : `Low stock for ${names}. Please refill soon.`;
      voice.speak(msg, i18n.language === 'te' ? 'te-IN' : 'en-IN');
    }
  }, [lowStock]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4200);
  };

  const fetchAll = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      const [meds, sched, str, adh, low] = await Promise.all([
        apiFetch('/api/medicines/'),
        apiFetch('/api/medicines/schedule/today'),
        apiFetch('/api/medicines/streak'),
        apiFetch('/api/medicines/adherence'),
        apiFetch('/api/medicines/low-stock'),
      ]);
      setMedicines(meds);
      setSchedule(sched);
      setStreak(str);
      setAdherence(adh);
      setLowStock(low);
    } catch {
      loadDemo();
    } finally {
      setFetching(false);
    }
  };

  const loadDemo = () => {
    const meds = [
      { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'twice_daily', time_slot: 'morning', stock_count: 12, pill_shape: 'circle', pill_color: '#0C96E8' },
      { id: 2, name: 'Amlodipine', dosage: '5mg', frequency: 'once_daily', time_slot: 'morning', stock_count: 3, pill_shape: 'oval', pill_color: '#DC2626' },
      { id: 3, name: 'Paracetamol', dosage: '650mg', frequency: 'thrice_daily', time_slot: 'afternoon', stock_count: 25, pill_shape: 'capsule', pill_color: '#EA580C' },
      { id: 4, name: 'Vitamin D3', dosage: '60000 IU', frequency: 'weekly', time_slot: 'morning', stock_count: 4, pill_shape: 'circle', pill_color: '#D97706' },
    ];
    setMedicines(meds);
    setSchedule(meds.map(m => ({
      medicine: m,
      status: m.id === 1 ? 'taken' : null,
      dosage_log_id: null,
    })));
    setStreak({ current_streak: 7, longest_streak: 21 });
    setLowStock([
      { medicine_id: 2, medicine_name: 'Amlodipine', stock_count: 3, message: 'Only 3 doses left' },
      { medicine_id: 4, medicine_name: 'Vitamin D3', stock_count: 4, message: 'Only 4 doses left' },
    ]);

    const today = new Date();
    const weekly = [], monthly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      weekly.push({ date: d.toISOString().split('T')[0], adherence_rate: Math.round(60 + Math.random() * 38) });
    }
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      monthly.push({ date: d.toISOString().split('T')[0], adherence_rate: Math.round(50 + Math.random() * 48) });
    }
    setAdherence({ weekly, monthly, overall_rate: 83.5, current_streak: 7, longest_streak: 21 });
  };

  const handleMarkDose = async (medicineId, status) => {
    const item = schedule.find(s => s.medicine.id === medicineId);
    try {
      await apiFetch('/api/medicines/dose', {
        method: 'POST',
        body: JSON.stringify({
          medicine_id: medicineId,
          scheduled_date: new Date().toISOString().split('T')[0],
          status,
        }),
      });
      fetchAll();
    } catch {
      setSchedule(prev => prev.map(s =>
        s.medicine.id === medicineId ? { ...s, status } : s
      ));
    }

    if (status === 'taken' && item) {
      showToast(`${item.medicine.name} — ${t('dashboard.taken')}`, 'success');
      if (voice.enabled) {
        const msg = i18n.language === 'te'
          ? `${item.medicine.name} తీసుకున్నారు. బాగా చేశారు!`
          : `${item.medicine.name} marked as taken. Well done!`;
        voice.speak(msg, i18n.language === 'te' ? 'te-IN' : 'en-IN');
      }
    } else if (status === 'missed') {
      showToast(`${item?.medicine.name} — ${t('dashboard.missed')}`, 'danger');
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
      showToast('Medicine deleted', 'success');
      fetchAll();
    } catch {
      setMedicines(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleDemoAlert = async (id) => {
    try {
      await apiFetch(`/api/alerts/instant-escalate/${id}`, { method: 'POST' });
    } catch (e) { /* demo */ }
    showToast('🚨 ' + t('dashboard.demo_alert_sent'), 'danger');
    if (voice.enabled) voice.speak('Guardian has been alerted!', 'en-IN');
  };

  const handleDownloadReport = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/medicines/report/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ayuguard_token')}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayuguard_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Report downloaded!', 'success');
      }
    } catch { showToast('Download failed. Please try again.', 'danger'); }
  };

  const takenToday   = schedule.filter(s => s.status === 'taken').length;
  const pendingToday = schedule.filter(s => !s.status).length;
  const adherencePct = adherence ? adherence.overall_rate : 0;

  if (authLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
        <p>Loading your health dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard container" id="dashboard-page">
      {/* Toast */}
      {toast && (
        <div className={`notification-toast ${toast.type}`}>
          <strong>{toast.msg}</strong>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-welcome">
            {t('dashboard.welcome')}, <span>{user?.full_name?.split(' ')[0] || 'Friend'}</span> 👋
          </h1>
          <p style={{ color: 'var(--clr-slate-500)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            {new Date().toLocaleDateString(i18n.language === 'te' ? 'te-IN' : 'en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${voice.enabled ? 'btn-primary' : 'btn-secondary'}`}
            onClick={voice.toggle}
            title={voice.enabled ? 'Disable voice' : 'Enable Telugu voice'}
            id="voice-toggle-btn"
          >
            {voice.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {voice.enabled ? t('dashboard.voice_on') : t('dashboard.voice_off')}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={fetchAll}
            disabled={fetching}
            title="Refresh"
          >
            <RefreshCw size={18} className={fetching ? 'spin-once' : ''} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="add-medicine-btn">
            <Plus size={20} /> {t('dashboard.add_medicine')}
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="mb-lg" id="low-stock-alerts">
          {lowStock.map(alert => (
            <div className="low-stock-alert" key={alert.medicine_id}>
              <AlertTriangle size={22} className="low-stock-icon" />
              <span className="low-stock-text">
                <strong>{alert.medicine_name}</strong> — {t('dashboard.low_stock_msg', { count: alert.stock_count })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid mb-lg" id="stats-grid">
        {[
          { icon: <Pill size={24} />, value: medicines.length, label: t('dashboard.total_medicines'), cls: 'blue' },
          { icon: <Check size={24} />, value: takenToday, label: t('dashboard.taken_today'), cls: 'green' },
          { icon: <Clock size={24} />, value: pendingToday, label: t('dashboard.pending_today'), cls: 'amber' },
          { icon: <TrendingUp size={24} />, value: `${adherencePct}%`, label: t('dashboard.adherence_percent'), cls: 'blue' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-nav" id="dashboard-tabs">
        {[
          { key: 'schedule', label: t('dashboard.schedule'), icon: <Clock size={17} /> },
          { key: 'reports',  label: t('dashboard.reports'),  icon: <BarChart3 size={17} /> },
          { key: 'chat',     label: t('dashboard.ai_assistant'), icon: <Bot size={17} /> },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'schedule' && (
        <ScheduleView
          schedule={schedule}
          onMark={handleMarkDose}
          onDelete={handleDeleteMedicine}
          onEdit={(med) => { setEditMedicine(med); setShowAddModal(true); }}
          onDemoAlert={handleDemoAlert}
          t={t}
        />
      )}
      {activeTab === 'reports' && (
        <ReportsView adherence={adherence} streak={streak} onDownload={handleDownloadReport} t={t} />
      )}
      {activeTab === 'chat' && (
        <ChatView t={t} apiFetch={apiFetch} voice={voice} lang={i18n.language} />
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <MedicineModal
          medicine={editMedicine}
          onClose={() => { setShowAddModal(false); setEditMedicine(null); }}
          onSave={() => { fetchAll(); setEditMedicine(null); }}
          t={t}
          apiFetch={apiFetch}
        />
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   SCHEDULE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function ScheduleView({ schedule, onMark, onDelete, onEdit, onDemoAlert, t }) {
  const order = { morning: 0, afternoon: 1, evening: 2, night: 3 };
  const sorted = [...schedule].sort((a, b) =>
    (order[a.medicine.time_slot] ?? 4) - (order[b.medicine.time_slot] ?? 4)
  );

  const taken  = sorted.filter(s => s.status === 'taken').length;
  const total  = sorted.length;

  if (!total) {
    return (
      <div className="card" style={{ width: '100%' }}>
        <div className="empty-state">
          <div className="empty-state-icon"><Pill size={36} /></div>
          <div className="empty-state-title">{t('dashboard.no_medicines')}</div>
          <div className="empty-state-desc">Click "Add Medicine" above to get started.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} color="var(--clr-primary)" />
            {t('dashboard.schedule')}
          </h2>
          {/* Progress pill */}
          <span style={{
            background: taken === total ? 'var(--clr-success-bg)' : 'var(--clr-blue-50)',
            color: taken === total ? 'var(--clr-success)' : 'var(--clr-primary)',
            border: `1.5px solid ${taken === total ? 'var(--clr-success-light)' : 'var(--clr-blue-200)'}`,
            borderRadius: '999px', padding: '0.3rem 0.875rem',
            fontWeight: 700, fontSize: '0.875rem'
          }}>
            {taken}/{total} done
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--clr-slate-100)', borderRadius: 99, marginBottom: 'var(--space-lg)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: total > 0 ? `${(taken / total) * 100}%` : '0%',
            background: taken === total
              ? 'linear-gradient(90deg, var(--clr-success), #047857)'
              : 'linear-gradient(90deg, var(--clr-blue-400), var(--clr-blue-600))',
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>

        <div className="schedule-list">
          {sorted.map((item, idx) => (
            <div
              className={`schedule-item${item.status === 'taken' ? ' taken-item' : ''}`}
              key={idx}
              id={`schedule-item-${idx}`}
            >
              <div className="schedule-time-badge">{t(`dashboard.${item.medicine.time_slot}`)}</div>

              <div className="schedule-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PillIcon shape={item.medicine.pill_shape} color={item.medicine.pill_color} size={30} />
                <div>
                  <div className="schedule-med-name">{item.medicine.name}</div>
                  <div className="schedule-dosage">{item.medicine.dosage}</div>
                </div>
              </div>

              {item.medicine.stock_count !== undefined && item.medicine.stock_count < 5 && (
                <span style={{
                  color: 'var(--clr-danger)', fontSize: 'var(--font-size-xs)',
                  fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <Package size={13} /> {item.medicine.stock_count} left
                </span>
              )}

              <div className="schedule-status">
                {item.status === 'taken' ? (
                  <span className="btn btn-success btn-sm" style={{ pointerEvents: 'none', opacity: 0.85 }}>
                    <Check size={16} /> {t('dashboard.taken')}
                  </span>
                ) : item.status === 'missed' ? (
                  <span className="btn btn-danger btn-sm" style={{ pointerEvents: 'none', opacity: 0.85 }}>
                    <X size={16} /> {t('dashboard.missed')}
                  </span>
                ) : (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => onMark(item.medicine.id, 'taken')}>
                      <Check size={16} /> {t('dashboard.take_medicine')}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', border: '1.5px solid var(--clr-danger-light)' }}
                      onClick={() => onMark(item.medicine.id, 'missed')}
                      title="Mark Missed"
                    >
                      <X size={16} />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#FFF7ED', color: '#C2410C', border: '1.5px solid #FED7AA' }}
                      onClick={() => onDemoAlert(item.medicine.id)}
                      title={t('dashboard.demo_alert')}
                    >
                      <AlertTriangle size={16} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm btn-icon"
                      onClick={() => onEdit(item.medicine)}
                      title="Edit"
                      style={{ minHeight: 40, width: 40 }}
                    >
                      <Pencil size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   REPORTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function ReportsView({ adherence, streak, onDownload, t }) {
  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">{t('dashboard.adherence_rate')}: {payload[0].value}%</p>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Streak + Download */}
      <div className="streak-display">
        <div className="streak-box">
          <div style={{ fontSize: '2rem', marginBottom: 4 }}>🔥</div>
          <div className="streak-number current">{streak.current_streak}</div>
          <div className="streak-label">{t('dashboard.current_streak')}</div>
          <div className="stat-label">{t('dashboard.days')}</div>
        </div>
        <div className="streak-box">
          <div style={{ fontSize: '2rem', marginBottom: 4 }}>🏆</div>
          <div className="streak-number" style={{ color: 'var(--clr-accent)' }}>{streak.longest_streak}</div>
          <div className="streak-label">{t('dashboard.longest_streak')}</div>
          <div className="stat-label">{t('dashboard.days')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onDownload}>
            <Download size={18} /> {t('dashboard.download_report')}
          </button>
        </div>
      </div>

      {/* Overall rate banner */}
      {adherence && (
        <div style={{
          background: 'linear-gradient(135deg, var(--clr-blue-500), var(--clr-blue-700))',
          borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)',
          color: 'white', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)',
          flexWrap: 'wrap',
        }}>
          <Activity size={40} style={{ opacity: 0.7, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {adherence.overall_rate}%
            </div>
            <div style={{ opacity: 0.85, fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
              Overall 30-day adherence rate — {adherence.overall_rate >= 80 ? '🌟 Excellent!' : adherence.overall_rate >= 60 ? '👍 Good, keep going!' : '💪 Let\'s improve!'}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="card" id="weekly-chart">
        <div className="card-header">
          <h2 className="card-title"><BarChart3 size={18} color="var(--clr-primary)" /> {t('dashboard.weekly_adherence')}</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={adherence?.weekly || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C96E8" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#0C96E8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE4EA" />
            <XAxis dataKey="date" tick={{ fill: '#6B7E91', fontSize: 12 }}
              tickFormatter={v => new Date(v).toLocaleDateString('en', { weekday: 'short' })} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6B7E91', fontSize: 12 }} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="adherence_rate" stroke="#0C96E8" strokeWidth={2.5}
              fill="url(#gradBlue)" dot={{ fill: '#0C96E8', r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: '#0C96E8', strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Chart */}
      <div className="card" id="monthly-chart">
        <div className="card-header">
          <h2 className="card-title"><BarChart3 size={18} color="var(--clr-primary)" /> {t('dashboard.monthly_adherence')}</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={adherence?.monthly || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE4EA" />
            <XAxis dataKey="date" tick={{ fill: '#6B7E91', fontSize: 11 }}
              tickFormatter={v => new Date(v).getDate()} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6B7E91', fontSize: 12 }} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="adherence_rate" fill="#0C96E8" radius={[4, 4, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   AI CHAT VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function ChatView({ t, apiFetch, voice, lang }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('dashboard.ai_greeting') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const FALLBACKS = [
    "That's a great question! For personalized advice, always consult your doctor.",
    "Please take your medicines on time. If side effects occur, contact your healthcare provider.",
    "Staying hydrated and eating nutritious meals complements your medication routine well.",
    "Light exercise — like walking 20–30 minutes daily — significantly improves overall health.",
    "If you're unsure about any medication, your pharmacist is always a great resource.",
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/chat/', {
        method: 'POST',
        body: JSON.stringify({ message: msg, history: messages.slice(-10) }),
      });
      const reply = res.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (voice.enabled) voice.speak(reply, lang === 'te' ? 'te-IN' : 'en-IN');
    } catch {
      const reply = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'What foods should I avoid with Metformin?',
    'Can I take Paracetamol on empty stomach?',
    'How to manage blood pressure naturally?',
  ];

  return (
    <div className="card" style={{ width: '100%' }} id="ai-chat">
      <div className="card-header">
        <h2 className="card-title">
          <Bot size={20} color="var(--clr-primary)" /> {t('dashboard.ai_assistant')}
        </h2>
        <span style={{
          background: 'var(--clr-success-bg)', color: 'var(--clr-success)',
          border: '1px solid var(--clr-success-light)', borderRadius: '999px',
          padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 700,
        }}>
          ● Online
        </span>
      </div>

      {messages.length === 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
          {quickQuestions.map((q, i) => (
            <button key={i}
              onClick={() => { setInput(q); }}
              style={{
                background: 'var(--clr-blue-50)', border: '1.5px solid var(--clr-blue-200)',
                borderRadius: 'var(--radius-full)', padding: '0.375rem 0.875rem',
                color: 'var(--clr-blue-600)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div className={`chat-bubble ${msg.role}`} key={idx}>{msg.content}</div>
          ))}
          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spinner" /> {t('dashboard.ai_thinking')}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder={t('dashboard.ai_placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            disabled={loading}
            id="chat-input"
          />
          <button
            className="btn btn-primary btn-icon"
            onClick={send}
            disabled={loading || !input.trim()}
            id="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MEDICINE MODAL (Add & Edit)
   ═══════════════════════════════════════════════════════════════════════════ */
const PILL_COLORS = ['#0C96E8', '#DC2626', '#059669', '#D97706', '#9333EA', '#EA580C', '#0891B2', '#BE185D'];

function MedicineModal({ medicine, onClose, onSave, t, apiFetch }) {
  const isEdit = !!medicine;
  const [form, setForm] = useState({
    name: medicine?.name || '',
    dosage: medicine?.dosage || '',
    frequency: medicine?.frequency || 'once_daily',
    time_slot: medicine?.time_slot || 'morning',
    stock_count: medicine?.stock_count ?? 30,
    notes: medicine?.notes || '',
    pill_shape: medicine?.pill_shape || 'circle',
    pill_color: medicine?.pill_color || '#0C96E8',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.dosage.trim()) {
      setError('Medicine name and dosage are required.'); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await apiFetch(`/api/medicines/${medicine.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/medicines/', {
          method: 'POST',
          body: JSON.stringify({ ...form, stock_count: Number(form.stock_count) }),
        });
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save medicine.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="medicine-modal">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          {isEdit ? `Edit ${medicine.name}` : t('dashboard.add_medicine')}
        </h2>

        {error && (
          <div className="low-stock-alert" style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="low-stock-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Medicine Name *</label>
            <input className="form-input" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="e.g. Metformin" required />
          </div>

          <div className="form-group">
            <label className="form-label">Dosage *</label>
            <input className="form-input" value={form.dosage}
              onChange={e => set('dosage', e.target.value)} placeholder="e.g. 500mg or 1 tablet" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">{t('dashboard.frequency')}</label>
              <select className="form-select" value={form.frequency}
                onChange={e => set('frequency', e.target.value)}>
                <option value="once_daily">Once Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="thrice_daily">Thrice Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('dashboard.time_slot')}</label>
              <select className="form-select" value={form.time_slot}
                onChange={e => set('time_slot', e.target.value)}>
                <option value="morning">{t('dashboard.morning')}</option>
                <option value="afternoon">{t('dashboard.afternoon')}</option>
                <option value="evening">{t('dashboard.evening')}</option>
                <option value="night">{t('dashboard.night')}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('dashboard.stock_count')} (pills)</label>
            <input className="form-input" type="number" value={form.stock_count}
              onChange={e => set('stock_count', e.target.value)} min="0" max="999" />
          </div>

          {/* Pill appearance */}
          <div className="form-group">
            <label className="form-label">Pill Shape</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {['circle', 'oval', 'capsule'].map(shape => (
                <button key={shape} type="button"
                  onClick={() => set('pill_shape', shape)}
                  style={{
                    flex: 1, minHeight: 52, borderRadius: 'var(--radius-md)',
                    border: `2px solid ${form.pill_shape === shape ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                    background: form.pill_shape === shape ? 'var(--clr-blue-50)' : 'white',
                    color: form.pill_shape === shape ? 'var(--clr-primary)' : 'var(--clr-slate-600)',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    textTransform: 'capitalize', transition: 'all 0.15s',
                  }}>
                  <PillIcon shape={shape} color={form.pill_color} size={22} />
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pill Color</label>
            <div className="pill-preview">
              {PILL_COLORS.map(c => (
                <button key={c} type="button"
                  className={`pill-swatch ${form.pill_color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('pill_color', c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input className="form-input" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Take with food, avoid grapefruit" />
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
            padding: 'var(--space-md)', background: 'var(--clr-slate-50)',
            borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)',
            border: '1.5px solid var(--clr-border-light)'
          }}>
            <PillIcon shape={form.pill_shape} color={form.pill_color} size={40} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--clr-slate-900)' }}>{form.name || 'Medicine Name'}</div>
              <div style={{ color: 'var(--clr-slate-500)', fontSize: 'var(--font-size-sm)' }}>
                {form.dosage || 'Dosage'} · {form.time_slot} · {form.stock_count} pills
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('dashboard.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="modal-save-btn">
              {saving ? <div className="spinner" /> : <><Check size={18} /> {t('dashboard.save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
