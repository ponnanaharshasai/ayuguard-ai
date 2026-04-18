import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles,
  Info,
  RefreshCcw
} from 'lucide-react';
import { identifyMedicine, getDosageGuidance } from '../utils/MedicalEngine';

export default function ChatView({ vitals }) {
  const { t, i18n } = useTranslation();
  const { user, apiFetch } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: i18n.language === 'te' ? 'నమస్కారం! నేను మీ ఆయుగార్డ్ AI సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?' : 'Hello! I am your AyuGuard AI assistant. How can I help you with your health today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = i18n.language === 'te' ? 'te-IN' : 'en-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition isn't supported in your browser.");
      }
    }
  };

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = i18n.language === 'te' ? 'te-IN' : 'en-US';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;
    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const medInfo = identifyMedicine(userMsg);
      let replyContent = '';

      if (medInfo) {
        const guidance = getDosageGuidance(medInfo.name, user.age || 65);
        if (i18n.language === 'te') {
          replyContent = `నేను ${medInfo.telugu_name} గురించి గుర్తించాను. ${medInfo.description} కోసం ఇది ఉపయోగించబడుతుంది.\n\n**సలహా:** ${guidance.dosage}\n\n**మార్గదర్శకత్వం:** ${guidance.guidance}\n\n> ⚠️ *${guidance.warning}*`;
        } else {
          replyContent = `I identified **${medInfo.name}**. ${medInfo.description}\n\n**Dosage:** ${guidance.dosage}\n\n**Guidance:** ${guidance.guidance}\n\n> ⚠️ *${guidance.warning}*`;
        }
      } else {
        const response = await apiFetch('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ 
            message: userMsg, 
            history: messages.filter(m => !m.isError).slice(-6),
            vitals: vitals,
            language: i18n.language 
          }),
        });
        
        if (!response) throw new Error("Could not reach API");
        replyContent = response.reply || response.content;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
      speak(replyContent);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = i18n.language === 'te' ? 'కనెక్షన్ లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'There was a connection error. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, isError: true, retryText: userMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
      {/* Disclaimer Banner */}
      <div style={{ 
        padding: '0.5rem 1.5rem', 
        backgroundColor: '#fffbeb', 
        borderBottom: '1px solid #fef3c7',
        color: '#92400e',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '600'
      }}>
        <ShieldAlert size={14} /> AI guidance is informational. Always follow your doctor's official prescription.
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '0.75rem',
            maxWidth: '100%'
          }}>
            {msg.role === 'assistant' && (
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: '#3b82f6', color: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>
            )}
            <div style={{ 
              backgroundColor: msg.role === 'user' ? '#3b82f6' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#1e293b',
              padding: '1rem',
              borderRadius: '1.25rem',
              borderTopRightRadius: msg.role === 'user' ? '0.25rem' : '1.25rem',
              borderTopLeftRadius: msg.role === 'assistant' ? '0.25rem' : '1.25rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              maxWidth: '80%',
              fontSize: '0.9375rem',
              lineHeight: '1.5',
              border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none'
            }}>
              {msg.role === 'assistant' && !msg.isError ? (
                <div style={{ '& p': { margin: 0 } }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.isError && (
                <button 
                  onClick={() => {
                    setMessages(prev => prev.filter(m => m !== msg));
                    handleSend(msg.retryText);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                >
                  <RefreshCcw size={14} /> Retry
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: '#e2e8f0', color: '#64748b', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', padding: '0.75rem', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                </div>
              </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              color: voiceEnabled ? '#3b82f6' : '#94a3b8',
              backgroundColor: voiceEnabled ? '#eff6ff' : '#f8fafc',
              padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {voiceEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('dashboard.ai_placeholder')}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: '1.5px solid #e2e8f0',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          
          <button 
            onClick={toggleListening}
            className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`} 
            style={{ 
              borderRadius: '0.75rem', padding: '0.75rem',
              backgroundColor: isListening ? '#ef4444' : undefined,
              color: isListening ? '#fff' : undefined,
              border: isListening ? 'none' : undefined
            }}
            title={isListening ? "Listening..." : "Voice Command"}
          >
            {isListening ? <MicOff size={22} className="animate-pulse" /> : <Mic size={22} />}
          </button>

          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ 
              borderRadius: '0.75rem', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!input.trim() || loading) ? 0.6 : 1
            }}
          >
            <Send size={22} />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Info size={12} /> Try: "Identify Paracetamol" or "పారాసిటమాల్ దేనికి?"
          </span>
        </div>
      </div>
    </div>
  );
}
