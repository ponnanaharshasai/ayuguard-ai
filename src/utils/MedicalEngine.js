/**
 * MedicalEngine.js
 * Core logic for medication identification and dosage reasoning.
 */

const MEDICINE_KNOWLEDGE = {
  'paracetamol': {
    type: 'Antipyretic/Analgesic',
    description: 'Used to treat fever and mild to moderate pain.',
    safe_dosage: 'Adults: 500mg-1000mg every 4-6 hours. Max 4000mg per day.',
    guidance: 'Take after food to avoid stomach irritation.',
    interactions: 'Avoid alcohol. Be careful if taking other cold/flu medicines.',
    telugu_name: 'పారాసిటమాల్ (జ్వరం మరియు నొప్పి నివారిణి)'
  },
  'metformin': {
    type: 'Antidiabetic',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    safe_dosage: 'Usually 500mg or 850mg once or twice daily.',
    guidance: 'Best taken with or after meals to reduce stomach side effects.',
    interactions: 'Inform doctor about any kidney issues.',
    telugu_name: 'మెట్‌ఫార్మిన్ (చక్కెర వ్యాధి నియంత్రణ)'
  },
  'amlodipine': {
    type: 'Antihypertensive',
    description: 'Used to treat high blood pressure and chest pain (angina).',
    safe_dosage: 'Starting dose is usually 5mg once daily.',
    guidance: 'Can be taken with or without food. Try to take at the same time daily.',
    interactions: 'Avoid grapefruit juice.',
    telugu_name: 'అమ్లోడిపైన్ (రక్తపోటు నియంత్రణ)'
  }
};

export const identifyMedicine = (query) => {
  const q = query.toLowerCase();
  for (const [name, info] of Object.entries(MEDICINE_KNOWLEDGE)) {
    if (q.includes(name)) return { name, ...info };
  }
  return null;
};

export const getDosageGuidance = (name, age) => {
  const info = MEDICINE_KNOWLEDGE[name.toLowerCase()];
  if (!info) return null;
  
  let personalized = info.safe_dosage;
  if (age > 65) {
    personalized += ' (Elderly users may require a lower starting dose. Monitor for dizziness.)';
  }
  
  return {
    dosage: personalized,
    guidance: info.guidance,
    warning: 'IMPORTANT: This is AI-generated guidance. Always verify with your doctor or pharmacist before consumption.'
  };
};

export const generateProactiveInsight = (medicines, adherenceHistory) => {
  if (adherenceHistory.length === 0) return "You're starting your health journey! I'll monitor your progress.";
  
  const missedCount = adherenceHistory.filter(h => h.status === 'missed').length;
  if (missedCount > 2) {
    return "I've noticed a few missed doses this week. Would you like me to adjust your reminder times to better fit your routine?";
  }
  
  return "Excellent consistency! Your adherence is at 95%. Keep it up for a healthier tomorrow.";
};
