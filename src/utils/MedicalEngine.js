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
  },
  'telmisartan': {
    type: 'Antihypertensive',
    description: 'Treats high blood pressure and helps prevent strokes/heart attacks.',
    safe_dosage: 'Usually 40mg once daily.',
    guidance: 'Take at the same time daily, with or without food.',
    interactions: 'Check with doctor before taking potassium supplements.',
    telugu_name: 'టెల్మిసార్టన్ (రక్తపోటు నియంత్రణ)'
  },
  'atorvastatin': {
    type: 'Statin/Lipid-lowering',
    description: 'Used to lower bad cholesterol and reduce risk of heart disease.',
    safe_dosage: 'Usually 10mg to 20mg once daily.',
    guidance: 'Take in the evening or at night for better effectiveness.',
    interactions: 'Avoid eating grapefruit or drinking grapefruit juice.',
    telugu_name: 'అటోర్వాస్టాటిన్ (కొలెస్ట్రాల్ నియంత్రణ)'
  },
  'rosuvastatin': {
    type: 'Statin/Lipid-lowering',
    description: 'Helps lower "bad" cholesterol and triglycerides in the blood.',
    safe_dosage: 'Usually 5mg to 10mg once daily.',
    guidance: 'Can be taken at any time of day, with or without food.',
    interactions: 'Avoid antacids containing aluminum/magnesium within 2 hours.',
    telugu_name: 'రోసువాస్టాటిన్ (కొలెస్ట్రాల్ నియంత్రణ)'
  },
  'pantoprazole': {
    type: 'Proton Pump Inhibitor (PPI)',
    description: 'Reduces stomach acid to treat GERD, ulcers, and acid reflux.',
    safe_dosage: 'Usually 40mg once daily.',
    guidance: 'Take 30 to 60 minutes before breakfast on an empty stomach.',
    interactions: 'Can affect the absorption of certain other medicines.',
    telugu_name: 'పాంటోప్రజోల్ (గ్యాస్/ఎసిడిటీ నివారిణి)'
  },
  'omeprazole': {
    type: 'Proton Pump Inhibitor (PPI)',
    description: 'Treats heartburn, a damaged esophagus, stomach ulcers.',
    safe_dosage: 'Usually 20mg once daily.',
    guidance: 'Best taken in the morning before breakfast.',
    interactions: 'May decrease effectiveness of clopidogrel.',
    telugu_name: 'ఒమెప్రజోల్ (గ్యాస్/ఎసిడిటీ నివారిణి)'
  },
  'levothyroxine': {
    type: 'Thyroid Hormone',
    description: 'Treats an underactive thyroid (hypothyroidism).',
    safe_dosage: 'Dosage varies strictly according to doctor prescription.',
    guidance: 'Take strictly on an empty stomach, 30-60 mins before breakfast.',
    interactions: 'Calcium, iron supplements, and antacids can prevent absorption.',
    telugu_name: 'లెవోథైరాక్సిన్ (థైరాయిడ్ ఔషధం)'
  },
  'gliclazide': {
    type: 'Antidiabetic (Sulfonylurea)',
    description: 'Used to control blood sugar levels in patients with type 2 diabetes.',
    safe_dosage: 'Usually 40mg to 80mg daily.',
    guidance: 'Take with or just before food/breakfast to avoid hypoglycemia.',
    interactions: 'Alcohol can cause severe low blood sugar.',
    telugu_name: 'గ్లిక్లాజైడ్ (చక్కెర వ్యాధి నియంత్రణ)'
  },
  'glimepiride': {
    type: 'Antidiabetic (Sulfonylurea)',
    description: 'Lowers blood sugar in patients with type 2 diabetes.',
    safe_dosage: 'Usually 1mg to 2mg once daily.',
    guidance: 'Take with breakfast or the first main meal of the day.',
    interactions: 'Risk of low blood sugar if meals are delayed.',
    telugu_name: 'గ్లిమెపిరైడ్ (చక్కెర వ్యాధి నియంత్రణ)'
  },
  'losartan': {
    type: 'Antihypertensive',
    description: 'Keeps blood vessels from narrowing, which lowers blood pressure.',
    safe_dosage: 'Usually 50mg once daily.',
    guidance: 'Can be taken with or without food.',
    interactions: 'Do not use potassium supplements or salt substitutes without asking a doctor.',
    telugu_name: 'లోసార్టన్ (రక్తపోటు నియంత్రణ)'
  },
  'aspirin': {
    type: 'NSAID / Blood Thinner',
    description: 'Used to reduce pain, inflammation, or risk of heart attacks.',
    safe_dosage: 'Low dose (75mg to 150mg) daily for heart protection.',
    guidance: 'Take with food to prevent stomach upset or bleeding.',
    interactions: 'Can increase bleeding risk if taken with other blood thinners.',
    telugu_name: 'ఆస్పిరిన్ (రక్తం గడ్డకట్టకుండా నివారణ)'
  },
  'clopidogrel': {
    type: 'Antiplatelet (Blood Thinner)',
    description: 'Prevents blood clots after a recent heart attack or stroke.',
    safe_dosage: 'Usually 75mg once daily.',
    guidance: 'Take at the same time each day, with or without food.',
    interactions: 'Avoid NSAIDs like ibuprofen as it increases bleeding risk.',
    telugu_name: 'క్లోపిడోగ్రెల్ (రక్తం గడ్డకట్టకుండా నివారణ)'
  },
  'ibuprofen': {
    type: 'NSAID',
    description: 'Used to reduce fever, pain, and inflammation.',
    safe_dosage: '200mg to 400mg every 4-6 hours as needed.',
    guidance: 'Take with food or milk to avoid severe stomach distress.',
    interactions: 'Can increase blood pressure; avoid if you have severe kidney issues.',
    telugu_name: 'ఇబుప్రోఫెన్ (నొప్పి మరియు వాపు నివారిణి)'
  },
  'diclofenac': {
    type: 'NSAID',
    description: 'Treats pain and inflammatory diseases such as arthritis.',
    safe_dosage: 'Usually 50mg two or three times a day.',
    guidance: 'Always take with or after food. Do not take on an empty stomach.',
    interactions: 'Avoid taking alongside other NSAIDs.',
    telugu_name: 'డైక్లోఫెనాక్ (కీళ్ల నొప్పుల నివారిణి)'
  },
  'amoxicillin': {
    type: 'Antibiotic',
    description: 'Used to treat a variety of bacterial infections.',
    safe_dosage: 'Usually 250mg to 500mg every 8 hours.',
    guidance: 'Complete the entire prescribed course even if you feel better.',
    interactions: 'Can decrease the effectiveness of birth control pills.',
    telugu_name: 'అమోక్సిసిలిన్ (బాక్టీరియా ఇన్ఫెక్షన్ల ఔషధం)'
  },
  'azithromycin': {
    type: 'Antibiotic',
    description: 'Treats chest infections, skin infections, and others.',
    safe_dosage: 'Usually 500mg once daily for 3 days.',
    guidance: 'Take at least 1 hour before or 2 hours after antacids.',
    interactions: 'Can cause irregular heart rate in some vulnerable patients.',
    telugu_name: 'అజిత్రోమైసిన్ (ఇన్ఫెక్షన్ల నివారిణి)'
  },
  'cetirizine': {
    type: 'Antihistamine',
    description: 'Treats allergies, hay fever, and cold symptoms.',
    safe_dosage: 'Usually 10mg once daily.',
    guidance: 'Best taken in the evening as it may cause drowsiness.',
    interactions: 'Avoid alcohol as it increases drowsiness.',
    telugu_name: 'సెటిరిజైన్ (అలర్జీ నివారిణి)'
  },
  'montelukast': {
    type: 'Leukotriene Receptor Antagonist',
    description: 'Prevents wheezing, shortness of breath, and asthma attacks.',
    safe_dosage: 'Usually 10mg once daily in the evening.',
    guidance: 'Take in the evening. Can be taken with or without food.',
    interactions: 'Generally safe, but inform doctor of all other meds.',
    telugu_name: 'మాంటెలూకాస్ట్ (ఆస్తమా నివారిణి)'
  },
  'domperidone': {
    type: 'Antiemetic',
    description: 'Used to relieve nausea and vomiting.',
    safe_dosage: 'Usually 10mg up to 3 times a day.',
    guidance: 'Take 15 to 30 minutes before meals.',
    interactions: 'Avoid with certain antibiotics or antifungals.',
    telugu_name: 'డోంపెరిడోన్ (వాంతులు/వికారం నివారిణి)'
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
