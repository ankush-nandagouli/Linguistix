import { createWorker } from 'tesseract.js';

declare global {
    interface Window {
        aksharmukha: any;
    }
}

export const OFFLINE_SUPPORTED_LANGUAGES = [
  { name: "Hindi", code: "hi", script: "Devanagari", internal: "Devanagari" },
  { name: "Bengali", code: "bn", script: "Bengali", internal: "Bengali" },
  { name: "Telugu", code: "te", script: "Telugu", internal: "Telugu" },
  { name: "Marathi", code: "mr", script: "Devanagari", internal: "Devanagari" },
  { name: "Tamil", code: "ta", script: "Tamil", internal: "Tamil" },
  { name: "Gujarati", code: "gu", script: "Gujarati", internal: "Gujarati" },
  { name: "Kannada", code: "kn", script: "Kannada", internal: "Kannada" },
  { name: "Malayalam", code: "ml", script: "Malayalam", internal: "Malayalam" },
  { name: "Punjabi", code: "pa", script: "Gurmukhi", internal: "Gurmukhi" },
  { name: "Odia", code: "or", script: "Odia", internal: "Oriya" },
];

export async function offlineDetectLanguage(text: string) {
    // Basic heuristic: check for script ranges
    const devanagari = /[\u0900-\u097F]/;
    const bengali = /[\u0980-\u09FF]/;
    const tamil = /[\u0B80-\u0BFF]/;
    
    if (devanagari.test(text)) return "Hindi/Devanagari";
    if (bengali.test(text)) return "Bengali";
    if (tamil.test(text)) return "Tamil";
    return "Unknown/Latin";
}

export async function offlineTransliterate(text: string, targetLanguage: string) {
  if (!window.aksharmukha) {
    return {
        transliteratedText: text + " [Syncing Engine...]",
        confidence: 0.2,
        detectedLanguage: "Offline"
    };
  }

  const isLatin = /^[A-Za-z0-9\s.,!?-]+$/.test(text);
  const sourceLang = isLatin ? 'ISO' : 'Devanagari'; 
  const targetObj = OFFLINE_SUPPORTED_LANGUAGES.find(l => l.name === targetLanguage);
  const target = targetObj?.internal || 'Devanagari';
  const detected = await offlineDetectLanguage(text);
  
  try {
    const result = window.aksharmukha.convert(text, sourceLang, target);
    return {
        transliteratedText: result,
        confidence: isLatin ? 0.85 : 0.7, // Heuristic confidence
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


