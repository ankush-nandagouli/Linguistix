import Sanscript from '@indic-transliteration/sanscript';
import { createWorker } from 'tesseract.js';

export const OFFLINE_SUPPORTED_LANGUAGES = [
  { name: "Hindi", code: "hi", script: "Devanagari", internal: "devanagari" },
  { name: "Bengali", code: "bn", script: "Bengali", internal: "bengali" },
  { name: "Telugu", code: "te", script: "Telugu", internal: "telugu" },
  { name: "Marathi", code: "mr", script: "Devanagari", internal: "devanagari" },
  { name: "Tamil", code: "ta", script: "Tamil", internal: "tamil" },
  { name: "Gujarati", code: "gu", script: "Gujarati", internal: "gujarati" },
  { name: "Kannada", code: "kn", script: "Kannada", internal: "kannada" },
  { name: "Malayalam", code: "ml", script: "Malayalam", internal: "malayalam" },
  { name: "Punjabi", code: "pa", script: "Gurmukhi", internal: "gurmukhi" },
  { name: "Odia", code: "or", script: "Odia", internal: "oriya" },
];

// High-frequency exceptions for perfect dictionary matching
const OFFLINE_LEXICON: Record<string, string> = {
  // English words translated to phonetic Devanagari
  "how": "हाउ",
  "are": "आर",
  "you": "यू",
  "hello": "हेलो",
  "world": "वर्ल्ड",
  "what": "व्हाट",
  "where": "व्हेयर",
  "why": "व्हाय",
  "when": "व्हेन",
  "who": "हू",
  "is": "इज़",
  "this": "दिस",
  "that": "दैट",
  "there": "देयर",
  "here": "हियर",
  "please": "प्लीज़",
  "thank": "थैंक",
  "thanks": "थैंक्स",
  "sorry": "सॉरी",
  "good": "गुड",
  "morning": "मॉर्निंग",
  "night": "नाइट",
  "work": "वर्क",
  "happy": "हैप्पी",
  "sad": "सैड",
  "great": "ग्रेट",
  "awesome": "ऑसम",
  "cool": "कूल",
  "today": "टुडे",
  "tomorrow": "टुमारो",
  "yesterday": "यस्टरडे",
  "friend": "फ्रेंड",
  "school": "स्कूल",
  "office": "ऑफिस",
  "yes": "यस",
  "no": "नो",
  "and": "एंड",
  "but": "बट",
  "with": "विद",
  "for": "फॉर",
  "the": "द",
  
  // Hinglish irregulars / common words
  "namaste": "नमस्ते",
  "namaskar": "नमस्कार",
  "shukriya": "शुक्रिया",
  "achha": "अच्छा",
  "acha": "अच्छा",
  "bahut": "बहुत",
  "bohot": "बहुत",
  "hain": "हैं",
  "hein": "हैं",
  "haan": "हाँ",
  "nahin": "नहीं",
  "nahi": "नहीं",
  "dhanyawad": "धन्यवाद",
  "dhanyavaad": "धन्यवाद",
  "bhaiya": "भैया",
  "didi": "दीदी",
  "pyaar": "प्यार",
  "pyar": "प्यार",
  "kya": "क्या",
  "kyun": "क्यों",
  "kyu": "क्यों",
  "samajh": "समझ",
};

// Rules for sequential vowel matching
const VOWEL_RULES = [
  { key: 'aai', initial: 'आई', medial: 'ाई' },
  { key: 'aau', initial: 'आउ', medial: 'ाउ' },
  { key: 'aaw', initial: 'आओ', medial: 'ाओ' },
  { key: 'aay', initial: 'आय', medial: 'ाय' },
  { key: 'aye', initial: 'आय', medial: 'ाय' },
  
  { key: 'aa', initial: 'आ', medial: 'ा' },
  { key: 'ai', initial: 'ऐ', medial: 'ै' },
  { key: 'au', initial: 'औ', medial: 'ौ' },
  { key: 'ay', initial: 'ए', medial: 'े' },
  { key: 'ee', initial: 'ई', medial: 'ी' },
  { key: 'ea', initial: 'ई', medial: 'ी' },
  { key: 'ei', initial: 'ई', medial: 'ी' },
  { key: 'ey', initial: 'ए', medial: 'े' },
  { key: 'ie', initial: 'ई', medial: 'ी' },
  { key: 'ii', initial: 'ई', medial: 'ी' },
  { key: 'oa', initial: 'ओ', medial: 'ो' },
  { key: 'oo', initial: 'ऊ', medial: 'ू' },
  { key: 'ou', initial: 'औ', medial: 'ौ' },
  { key: 'ow', initial: 'आउ', medial: 'ाउ' },
  { key: 'oy', initial: 'ऑय', medial: 'ॉय' },
  { key: 'ui', initial: 'ुई', medial: 'ुई' },
  { key: 'uy', initial: 'ाय', medial: 'ाय' },
  { key: 'aw', initial: 'ॉ', medial: 'ॉ' },
  
  { key: 'a', initial: 'अ', medial: '' }, // Empty medial means schwa / inherent vowel
  { key: 'e', initial: 'ए', medial: 'े' },
  { key: 'i', initial: 'इ', medial: 'ि' },
  { key: 'o', initial: 'ओ', medial: 'ो' },
  { key: 'u', initial: 'उ', medial: 'ु' },
  { key: 'y', initial: 'इ', medial: 'ि' },
];

// Rules for consonant mappings
const CONSONANT_RULES = [
  { key: 'ksh', rule: 'क्ष' },
  { key: 'gya', rule: 'ज्ञ' },
  { key: 'gy', rule: 'ज्ञ' },
  { key: 'tri', rule: 'त्रि' },
  { key: 'tra', rule: 'त्र' },
  { key: 'sch', rule: 'श्क' },
  
  { key: 'kh', rule: 'ख' },
  { key: 'gh', rule: 'घ' },
  { key: 'chh', rule: 'छ' },
  { key: 'ch', rule: 'च' },
  { key: 'jh', rule: 'झ' },
  { key: 'th', rule: 'थ' },
  { key: 'dh', rule: 'ध' },
  { key: 'ph', rule: 'फ' },
  { key: 'bh', rule: 'भ' },
  { key: 'sh', rule: 'श' },
  { key: 'zh', rule: 'ज़' },
  { key: 'wh', rule: 'व्ह' },
  { key: 'kn', rule: 'न' },
  { key: 'gn', rule: 'न' },
  { key: 'wr', rule: 'र' },
  { key: 'ck', rule: 'क' },
  { key: 'dg', rule: 'ज' },
  { key: 'qu', rule: 'क्व' },
  
  { key: 'k', rule: 'क' },
  { key: 'g', rule: 'ग' },
  { key: 'j', rule: 'ज' },
  { key: 't', rule: 'त' }, // Default dental t
  { key: 'd', rule: 'द' }, // Default dental d
  { key: 'n', rule: 'न' },
  { key: 'p', rule: 'प' },
  { key: 'f', rule: 'फ' },
  { key: 'b', rule: 'ब' },
  { key: 'm', rule: 'म' },
  { key: 'y', rule: 'य' },
  { key: 'r', rule: 'र' },
  { key: 'l', rule: 'ल' },
  { key: 'v', rule: 'व' },
  { key: 'w', rule: 'व' },
  { key: 's', rule: 'स' },
  { key: 'h', rule: 'ह' },
  { key: 'z', rule: 'ज़' },
  { key: 'x', rule: 'क्स' },
  { key: 'c', rule: 'क' },
  { key: 'q', rule: 'क' },
];

function phoneticToDevanagari(word: string): string {
  let index = 0;
  interface Token {
    type: 'vowel' | 'consonant';
    initial: string;
    medial: string;
    consonantMap?: string;
  }
  const tokens: Token[] = [];

  while (index < word.length) {
    let matched = false;

    // 1. Match vowels (using sequential prefix check)
    for (const rule of VOWEL_RULES) {
      if (word.startsWith(rule.key, index)) {
        // Special end-of-word heuristics
        if (rule.key === 'a' && index === word.length - 1 && word.length > 1) {
          // Final 'a' maps to the long 'aa' matra explicitly (e.g. "bura" -> "बुरा")
          tokens.push({ type: 'vowel', initial: 'आ', medial: 'ा' });
        } else if (rule.key === 'y' && index === word.length - 1 && word.length > 1) {
          // Final 'y' maps to 'ee' explicitly (e.g. "mummy" -> "मम्मी")
          tokens.push({ type: 'vowel', initial: 'ई', medial: 'ी' });
        } else if (rule.key === 'i' && index === word.length - 1 && word.length > 1) {
          // Final 'i' maps to long 'ee' matra in Hinglish/Hindi (e.g. "khushi" -> "खुशी", "didi" -> "दीदी")
          tokens.push({ type: 'vowel', initial: 'ई', medial: 'ी' });
        } else {
          tokens.push({ type: 'vowel', initial: rule.initial, medial: rule.medial });
        }
        index += rule.key.length;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // 2. Match consonants
    for (const rule of CONSONANT_RULES) {
      if (word.startsWith(rule.key, index)) {
        // 'c' followed by details sounding like 's'
        if (rule.key === 'c' && index + 1 < word.length && /^[eiy]$/.test(word[index + 1])) {
          tokens.push({ type: 'consonant', initial: 'स', medial: '', consonantMap: 'स' });
        } else {
          tokens.push({ type: 'consonant', initial: rule.rule, medial: '', consonantMap: rule.rule });
        }
        index += rule.key.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Unrecognized character
      const char = word[index];
      if (/^[a-z]$/i.test(char)) {
        tokens.push({ type: 'consonant', initial: 'क', medial: '', consonantMap: 'क' });
      }
      index++;
    }
  }

  // Combine matched tokens into Devanagari script representation
  let output = '';
  let lastWasConsonant = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'vowel') {
      if (lastWasConsonant) {
        output += token.medial;
      } else {
        output += token.initial;
      }
      lastWasConsonant = false;
    } else {
      // Consonant logic
      const currentCons = token.consonantMap || '';
      if (lastWasConsonant) {
        // Consecutive consonants require virama (halant) to form a half-letter/consonant cluster
        output += '\u094D' + currentCons;
      } else {
        output += currentCons;
      }
      lastWasConsonant = true;
    }
  }

  return output;
}

export function offlineDetectLanguage(text: string) {
    // Basic heuristic: check for script ranges
    const devanagari = /[\u0900-\u097F]/;
    const bengali = /[\u0980-\u09FF]/;
    const tamil = /[\u0B80-\u0BFF]/;
    
    if (devanagari.test(text)) return "Hindi/Devanagari";
    if (bengali.test(text)) return "Bengali";
    if (tamil.test(text)) return "Tamil";
    return "Unknown/Latin";
}

export async function warmupEngine() {
    console.log("Offline Engine (Bundled) Ready");
}

export async function offlineTransliterate(text: string, targetLanguage: string) {
  const containsLatin = /[a-zA-Z]/.test(text);
  const targetObj = OFFLINE_SUPPORTED_LANGUAGES.find(l => l.name === targetLanguage);
  const targetScript = targetObj?.internal || 'devanagari';
  
  const detected = offlineDetectLanguage(text);
  
  try {
    let devanagariText = '';

    if (containsLatin) {
      // Split into words while keeping punctuation, numbers, spaces intact
      const segments = text.split(/([a-zA-Z]+)/);
      const convertedSegments = segments.map((seg) => {
        if (/^[a-zA-Z]+$/.test(seg)) {
          const lower = seg.toLowerCase();
          // Dictionary exception check
          if (OFFLINE_LEXICON[lower]) {
            return OFFLINE_LEXICON[lower];
          }
          // Algorithmic phonetic transliteration fallback
          return phoneticToDevanagari(lower);
        }
        return seg; // Punctuation, spaces, numbers, other scripts
      });
      devanagariText = convertedSegments.join('');
    } else {
      // Source text is already in an Indic script, default to direct transliteration
      devanagariText = text;
    }

    // Now convert the intermediate Devanagari script to the target language script
    const result = Sanscript.t(devanagariText, 'devanagari', targetScript);

    return {
        transliteratedText: result,
        confidence: containsLatin ? 0.95 : 0.8,
        detectedLanguage: detected
    };
  } catch (error) {
    console.error("Offline transliteration failed:", error);
    return {
        transliteratedText: text,
        confidence: 0.1,
        detectedLanguage: "Error"
    };
  }
}

export async function offlineOCR(image: string) {
    const worker = await createWorker('eng+hin+ben+tam+tel+mal+kan+guj+pan+ori');
    try {
        const { data: { text, confidence } } = await worker.recognize(image);
        await worker.terminate();
        return { text, confidence: confidence / 100 };
    } catch (error) {
        console.error("Offline OCR failed:", error);
        await worker.terminate();
        return { text: "", confidence: 0 };
    }
}
