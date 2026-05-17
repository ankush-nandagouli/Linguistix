import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Copy } from 'lucide-react';
import { SUPPORTED_LANGUAGES, transliterateImage } from '../services/gemini';
import { offlineOCR, offlineTransliterate } from '../services/offline';
import { auth } from '../lib/firebase';
import { saveHistory } from '../lib/db';
import { motion } from 'motion/react';

export const ImageTransliteration: React.FC = () => {
  const [outputText, setOutputText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [detectedLang, setDetectedLang] = useState('');
  const [targetLang, setTargetLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (base64: string) => {
    setIsLoading(true);
    try {
      if (isOffline) {
        // Offline Pipeline: Tesseract OCR -> Aksharmukha Transliterate
        const ocrResult = await offlineOCR(base64);
        if (ocrResult.text.trim()) {
            const transResult = await offlineTransliterate(ocrResult.text, targetLang.name);
            const result = transResult.transliteratedText;
            setOutputText(result);
            setConfidence(ocrResult.confidence);
            setDetectedLang(transResult.detectedLanguage);
            
            if (auth.currentUser) {
              saveHistory({
                userId: auth.currentUser.uid,
                originalText: '[Image Content]',
                transliteratedText: result,
                targetLanguage: targetLang.name,
                type: 'image',
                timestamp: Date.now()
              }).catch(err => console.error("IndexedDB Save Error:", err));
            }
        } else {
            setOutputText("No text detected offline");
            setConfidence(0);
        }
      } else {
        const result = await transliterateImage(base64, targetLang.name);
        setOutputText(result);
        setConfidence(0.9); // Gemini usually high
        setDetectedLang('Visual Detection');
        
        if (auth.currentUser) {
          saveHistory({
            userId: auth.currentUser.uid,
            originalText: '[Image Content]',
            transliteratedText: result,
            targetLanguage: targetLang.name,
            type: 'image',
            timestamp: Date.now()
          }).catch(error => {
            console.error("IndexedDB Save Error:", error);
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImagePreview(base64);
        await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="border-b-4 border-slate-900 pb-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Sign Board Lens</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-orange-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Automated Visual Extraction</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-4 border-slate-900 aspect-square flex flex-col items-center justify-center p-0 cursor-pointer overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                />
                {imagePreview ? (
                    <div className="w-full h-full relative group">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Overlay preview" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Retake Photo</p>
                        </div>
                        {outputText && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white/95 border-4 border-slate-900 px-8 py-6 shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]"
                                >
                                    <p className="text-4xl md:text-6xl font-black text-slate-900 text-center leading-none tracking-tighter">{outputText}</p>
                                </motion.div>
                            </div>
                        )}
                        {isLoading && (
                             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                                <div className="bg-white px-6 py-4 border-4 border-slate-900 flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent animate-spin"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Scanning Signage...</span>
                                </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center group">
                        <div className="w-24 h-24 bg-slate-50 flex items-center justify-center border-2 border-slate-200 mb-6 group-hover:border-orange-500 transition-colors">
                            <Camera size={40} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 mb-1">Click to Capture</p>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-300">Front view recommended</p>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Engine Config</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Vision v1.2 Active</span>
                    </div>
                </div>
                <select 
                    value={targetLang.code}
                    onChange={(e) => {
                        const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!;
                        setTargetLang(lang);
                        if (imagePreview) processImage(imagePreview);
                    }}
                    className="w-full bg-slate-800 border-none p-4 text-white font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">{lang.name} - {lang.script}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="flex flex-col gap-6">
             <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(241,245,249,1)] h-full flex flex-col justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Extracted Output</h3>
                   <div className="flex items-center gap-4 mb-8">
                        <div className="h-1 w-12 bg-orange-500"></div>
                        {detectedLang && <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{detectedLang}</span>}
                        {isOffline && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Offline Engine</span>}
                   </div>
                   
                   <div className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                        {isLoading ? (
                            <div className="space-y-3 opacity-20">
                                <div className="h-10 bg-slate-900 w-full animate-pulse"></div>
                                <div className="h-10 bg-slate-900 w-2/3 animate-pulse"></div>
                            </div>
                        ) : outputText ? (
                            outputText
                        ) : (
                            <span className="text-slate-100">Upload to See Effect</span>
                        )}
                   </div>
                   {confidence !== null && !isLoading && (
                        <div className="mt-4 flex items-center gap-2">
                             <div className={`w-2 h-2 ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.5 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                             <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Confidence Score: {(confidence * 100).toFixed(0)}%</span>
                        </div>
                   )}
                </div>

                {outputText && !isLoading && (
                    <div className="mt-12 flex items-center gap-4 pt-8 border-t border-slate-100">
                         <button 
                            onClick={handleCopy}
                            className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors"
                         >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Result'}
                         </button>
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors"
                         >
                            <Camera size={14} />
                         </button>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
