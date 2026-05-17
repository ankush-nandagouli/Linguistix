import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Copy, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, transliterateText } from '../services/gemini';
import { offlineTransliterate } from '../services/offline';
import { speak, createSpeechRecognizer } from '../services/speech';
import { auth } from '../lib/firebase';
import { saveHistory } from '../lib/db';

export const TextTransliteration: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [targetLang, setTargetLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const count = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    setWordCount(count);
  }, [inputText]);

  const isOverLimit = wordCount > 100;

  const handleTransliterate = async () => {
    if (!inputText.trim() || isOverLimit) return;
    setIsLoading(true);
    try {
      let data;
      if (isOffline) {
        data = await offlineTransliterate(inputText, targetLang.name);
      } else {
        // Add a 5s timeout to the online call to fallback to offline if the network is slow
        const onlinePromise = transliterateText(inputText, targetLang.name);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 5000)
        );

        try {
          data = await Promise.race([onlinePromise, timeoutPromise]) as any;
        } catch (err: any) {
          if (err.message === 'TIMEOUT') {
             console.log("Online transliteration timed out, falling back to offline engine");
             data = await offlineTransliterate(inputText, targetLang.name);
          } else {
             throw err;
          }
        }
      }

      if (data.transliteratedText.includes('[Loading') || data.transliteratedText.includes('[Engine')) {
          setOutputText(data.transliteratedText);
          setIsLoading(false);
          return;
      }

      setOutputText(data.transliteratedText);
      setDetectedLang(data.detectedLanguage);
      setConfidence(data.confidence);
      
      if (auth.currentUser) {
        console.log("Saving history (IndexedDB) for UID:", auth.currentUser.uid);
        saveHistory({
          userId: auth.currentUser.uid,
          originalText: inputText,
          transliteratedText: data.transliteratedText,
          targetLanguage: targetLang.name,
          type: 'text',
          timestamp: Date.now()
        }).catch(error => {
          console.error("IndexedDB Save Error:", error);
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    recognitionRef.current = createSpeechRecognizer(
      (text) => setInputText(prev => prev + ' ' + text),
      () => setIsListening(false)
    );
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (outputText) {
      speak(outputText, targetLang.code);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="border-b-4 border-slate-900 pb-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Text Entry</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-orange-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Phonetic Text Conversion</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-none border-2 border-slate-200 shadow-[8px_8px_0px_0px_rgba(226,232,240,1)]">
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-100 bg-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Text</span>
                        {detectedLang && <span className="text-[8px] font-bold text-orange-500 uppercase tracking-wider">Detected: {detectedLang}</span>}
                        {isOffline && <span className="text-[8px] font-black text-red-500 uppercase tracking-wider">Offline Mode</span>}
                    </div>
                    <button 
                        onClick={toggleMic}
                        className={`p-2 rounded-none transition-colors border ${isListening ? 'bg-orange-500 text-white border-orange-600' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-900'}`}
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                </div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or speak something..."
                    className="w-full h-64 md:h-80 p-8 text-xl md:text-2xl font-bold bg-transparent border-none focus:ring-0 resize-none text-slate-900 placeholder:text-slate-200 outline-none"
                />
                <div className="px-8 pb-4 flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOverLimit ? 'text-red-500' : 'text-slate-300'}`}>
                        {wordCount} / 100 Words
                    </span>
                    {isOverLimit && (
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Limit Exceeded</span>
                    )}
                </div>
            </div>
            
            <button
                disabled={isLoading || !inputText || isOverLimit}
                onClick={handleTransliterate}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : 'Transliterate'}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-none border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] flex flex-col h-full min-h-[20rem] relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <select 
                        value={targetLang.code}
                        onChange={(e) => setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
                        className="bg-transparent text-[10px] font-black text-orange-500 border-none focus:ring-0 cursor-pointer uppercase tracking-widest"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">{lang.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button onClick={handleSpeak} className="p-2 bg-slate-800 text-slate-400 hover:text-white transition-colors"><Volume2 size={16} /></button>
                        <button onClick={handleCopy} className="p-2 bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            {copied ? <Check size={16} className="text-orange-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter whitespace-pre-wrap">
                        {isLoading ? (
                            <div className="flex flex-col gap-6 opacity-30">
                                <div className="h-10 bg-white w-full animate-pulse"></div>
                                <div className="h-10 bg-white w-3/4 animate-pulse"></div>
                            </div>
                        ) : outputText || (
                            <span className="text-slate-800">नमस्ते?</span>
                        )}
                    </div>
                    {outputText && !isLoading && (
                        <div className="mt-8 flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 ${confidence && confidence > 0.8 ? 'bg-green-500' : confidence && confidence > 0.5 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {confidence ? `Confidence: ${(confidence * 100).toFixed(0)}%` : 'Preservation High'}
                                </span>
                             </div>
                             {confidence && confidence < 0.6 && (
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">Script mapping might be ambiguous. Verify phonetics.</p>
                             )}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-orange-500 px-4 py-1 border-2 border-slate-900">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">{targetLang.script}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
