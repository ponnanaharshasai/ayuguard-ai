import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: { name: 'AyuGuard AI' },
      nav: { dashboard: 'Dashboard', login: 'Login', signup: 'Sign Up', logout: 'Logout' },
      landing: {
        hero_title: 'Never Miss a Dose Again',
        hero_subtitle: 'A smart medical companion designed with care for you and your loved ones.',
        get_started: 'Get Started',
        learn_more: 'How it Works',
        features_title: 'Advanced Health Management',
        features_subtitle: 'Intelligent features to keep you safe and healthy.',
        feature_reminders_title: 'Smart Reminders',
        feature_reminders_desc: 'Receive timely alerts for all your medications.',
        feature_ai_title: 'AI Health Companion',
        feature_ai_desc: 'A proactive AI that understands your health needs.',
        feature_voice_title: 'Voice Support',
        feature_voice_desc: 'Simple voice interactions in English and Telugu.',
      },
      dashboard: {
        welcome: 'Welcome',
        total_medicines: 'Total Medicines',
        taken_today: 'Taken Today',
        pending_today: 'Pending',
        adherence_percent: 'Adherence',
        schedule: 'Daily Schedule',
        reports: 'Health Reports',
        ai_assistant: 'AI Companion',
        add_medicine: 'Add Medicine',
        voice_on: 'Voice On',
        voice_off: 'Voice Off',
        no_medicines: 'No medicines added yet',
        take_medicine: 'Take Now',
        taken: 'Taken',
        missed: 'Missed',
        low_stock_msg: 'Only {{count}} left',
        ai_greeting: 'Hello! I am your AyuGuard AI assistant. How can I help you with your health today?',
        ai_placeholder: 'Ask about your medicines...',
        ai_thinking: 'Analyzing...',
        frequency: 'How often?',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        night: 'Night',
      }
    }
  },
  te: {
    translation: {
      app: { name: 'ఆయుగార్డ్ AI' },
      nav: { dashboard: 'డాష్‌బోర్డ్', login: 'లాగిన్', signup: 'సైన్ అప్', logout: 'లాగౌట్' },
      landing: {
        hero_title: 'ఏ మందునూ మరిచిపోవద్దు',
        hero_subtitle: 'మీ కోసం మరియు మీ ప్రియమైన వారి కోసం రూపొందించబడిన స్మార్ట్ మెడికల్ కంపానియన్.',
        get_started: 'ప్రారంభించండి',
        learn_more: 'ఇది ఎలా పనిచేస్తుంది',
        features_title: 'అధునాతన ఆరోగ్య నిర్వహణ',
        features_subtitle: 'మిమ్మల్ని సురక్షితంగా మరియు ఆరోగ్యంగా ఉంచడానికి తెలివైన ఫీచర్లు.',
        feature_reminders_title: 'స్మార్ట్ రిమైండర్లు',
        feature_reminders_desc: 'మీ అన్ని మందుల కోసం సరైన సమయంలో అలర్ట్ పొందండి.',
        feature_ai_title: 'AI హెల్త్ కంపానియన్',
        feature_ai_desc: 'మీ ఆరోగ్య అవసరాలను అర్థం చేసుకునే ప్రోయాక్టివ్ AI.',
        feature_voice_title: 'వాయిస్ సపోర్ట్',
        feature_voice_desc: 'తెలుగు మరియు ఇంగ్లీష్‌లో సాధారణ వాయిస్ సంభాషణలు.',
      },
      dashboard: {
        welcome: 'స్వాగతం',
        total_medicines: 'మొత్తం మందులు',
        taken_today: 'ఈ రోజు వేసుకున్నవి',
        pending_today: 'మిగిలి ఉన్నవి',
        adherence_percent: 'క్రమశిక్షణ',
        schedule: 'నేటి షెడ్యూల్',
        reports: 'ఆరోగ్య నివేదికలు',
        ai_assistant: 'AI సహాయకుడు',
        add_medicine: 'మందును జోడించండి',
        voice_on: 'వాయిస్ ఆన్',
        voice_off: 'వాయిస్ ఆఫ్',
        no_medicines: 'ఇంకా మందులు ఏవీ జోడించలేదు',
        take_medicine: 'ఇప్పుడు వేసుకోండి',
        taken: 'వేసుకున్నారు',
        missed: 'మరిచిపోయారు',
        low_stock_msg: 'కేవలం {{count}} మాత్రమే ఉన్నాయి',
        ai_greeting: 'నమస్కారం! నేను మీ ఆయుగార్డ్ AI సహాయకుడిని. ఈ రోజు మీ ఆరోగ్యం గురించి నేను మీకు ఎలా సహాయం చేయగలను?',
        ai_placeholder: 'మీ మందుల గురించి అడగండి...',
        ai_thinking: 'ఆలోచిస్తున్నాను...',
        frequency: 'ఎన్ని సార్లు?',
        morning: 'ఉదయం',
        afternoon: 'మధ్యాహ్నం',
        evening: 'సాయంత్రం',
        night: 'రాత్రి',
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('ayuguard_lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
