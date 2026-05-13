import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const SUPPORTED_LANGUAGES = [
  { name: "Hindi", code: "hi", script: "Devanagari" },
  { name: "Bengali", code: "bn", script: "Bengali" },
  { name: "Telugu", code: "te", script: "Telugu" },
  { name: "Marathi", code: "mr", script: "Devanagari" },
  { name: "Tamil", code: "ta", script: "Tamil" },
  { name: "Gujarati", code: "gu", script: "Gujarati" },
  { name: "Kannada", code: "kn", script: "Kannada" },
  { name: "Malayalam", code: "ml", script: "Malayalam" },
  { name: "Punjabi", code: "pa", script: "Gurmukhi" },
  { name: "Odia", code: "or", script: "Odia" },
];

export async function transliterateText(text: string, targetLanguage: string) {
  const prompt = `
    You are LinguisticX, a high-fidelity transliteration engine.
    
    TASK:
    1. Detect the source language and script of the input.
    2. Transliterate the input text into the ${targetLanguage} script while maintaining absolute phonetic integrity.
    
    GUIDELINES:
    - Return a JSON object with three fields: "detectedLanguage", "transliteratedText", and "confidence" (a number between 0 and 1).
    - Do NOT translate meaning. Only map sounds.
    - If input is English, map English phonemes to ${targetLanguage}.
    - Ensure names, places, and brands sound exactly right.

    Input: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (error) {
    console.warn("Gemini detection/transliteration failed, falling back to basic:", error);
    // Fallback if structured output fails
    const basicPrompt = `Transliterate strictly phonetically to ${targetLanguage} script: "${text}". Return only text.`;
    const basicRes = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: basicPrompt
    });
    return { detectedLanguage: "Detected", transliteratedText: (basicRes.text || "").trim(), confidence: 0.5 };
  }
}


export async function transliterateImage(base64Image: string, targetLanguage: string) {
  const mimeType = base64Image.match(/data:([^;]+);base64/)?.[1] || "image/jpeg";
  const prompt = `
    You are an expert in Indian languages and scripts, specializing in OCR and Phonetic Transliteration for signage and billboards.
    1. Scan the provided image carefully to find the most prominent text (e.g., a shop name, sign board, or billboard text).
    2. Extract that text EXACTLY as it sounds in its original language.
    3. Transliterate those sounds into the ${targetLanguage} script.
    
    CRITICAL INSTRUCTIONS:
    - PHONETIC ACCURACY: The transliterated output MUST represent the sounds of the original text.
    - NO TRANSLATION: Do not translate the meaning. If the sign says "Welcome", transliterate the sound "Welcome" into ${targetLanguage} letters, DO NOT write the ${targetLanguage} word for welcome.
    - Return ONLY the transliterated script text. No English, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image.split(",")[1],
            }
          },
          { text: prompt }
        ]
      },
    });
    
    return (response.text || "").trim();
  } catch (error) {
    console.error("Image transliteration error:", error);
    throw error;
  }
}

