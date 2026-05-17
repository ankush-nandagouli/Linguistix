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
    // No-op for bundled version
    console.log("Offline Engine (Bundled) Ready");
}

export async function offlineTransliterate(text: string, targetLanguage: string) {
  const isLatin = /^[A-Za-z0-9\s.,!?-]+$/.test(text);
  const sourceLang = isLatin ? 'itrans' : 'devanagari'; 
  const targetObj = OFFLINE_SUPPORTED_LANGUAGES.find(l => l.name === targetLanguage);
  const target = targetObj?.internal || 'devanagari';
  
  const detected = offlineDetectLanguage(text);
  
  try {
    const result = Sanscript.t(text, sourceLang, target);
    return {
        transliteratedText: result,
        confidence: isLatin ? 0.95 : 0.8,
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


