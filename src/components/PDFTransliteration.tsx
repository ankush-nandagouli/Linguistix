import React, { useState, useRef } from 'react';
import { FileText, Download, Upload } from 'lucide-react';
import { SUPPORTED_LANGUAGES, transliterateText } from '../services/gemini';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { extractTextFromPDF, generateTransliteratedPDF } from '../services/pdf';

export const PDFTransliteration: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [targetLang, setTargetLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    
    setFileName(file.name.replace('.pdf', ''));
    try {
      setIsLoading(true);
      const text = await extractTextFromPDF(file);
      setInputText(text);
    } catch (error) {
      console.error("PDF extraction failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [detectedLang, setDetectedLang] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleTransliterate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const data = await transliterateText(inputText, targetLang.name);
      setOutputText(data.transliteratedText);
      setDetectedLang(data.detectedLanguage);
      setConfidence(data.confidence);
      
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'history'), {
            userId: auth.currentUser.uid,
            originalText: inputText,
            transliteratedText: data.transliteratedText,
            targetLanguage: targetLang.name,
            type: 'pdf',
            timestamp: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'history');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="border-b-4 border-slate-900 pb-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Document Processor</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-orange-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">PDF to Script Pipeline</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-4 border-dashed border-slate-200 p-12 text-center cursor-pointer hover:border-orange-500 transition-colors group relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(226,232,240,1)]"
            >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
                <div className="relative z-10">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">
                        {fileName ? fileName : 'Upload Single Page PDF'}
                    </p>
                </div>
            </div>

            {inputText && (
                <div className="bg-slate-50 border-2 border-slate-200 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Extracted Content Preview</p>
                    <p className="text-sm font-medium text-slate-900 line-clamp-4 leading-relaxed">{inputText}</p>
                </div>
            )}
            
            <button
                disabled={isLoading || !inputText}
                onClick={handleTransliterate}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] transition-all"
            >
                {isLoading ? 'Processing Document...' : 'Generate Transliteration'}
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
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    {outputText && (
                        <button 
                            onClick={() => generateTransliteratedPDF(inputText, outputText, fileName || 'transliterated')}
                            className="p-2 bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <Download size={16} />
                        </button>
                    )}
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="text-4xl font-black text-white leading-tight tracking-tighter whitespace-pre-wrap">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-8 bg-slate-800 w-full"></div>
                                <div className="h-8 bg-slate-800 w-2/3"></div>
                            </div>
                        ) : outputText || (
                            <span className="text-slate-800">Waiting for data...</span>
                        )}
                    </div>
                    {outputText && !isLoading && (
                        <div className="mt-8 flex flex-col gap-2 pt-4 border-t border-slate-800">
                             <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 ${confidence && confidence > 0.8 ? 'bg-green-500' : confidence && confidence > 0.5 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {confidence ? `Confidence: ${(confidence * 100).toFixed(0)}%` : 'Preservation High'}
                                </span>
                                {detectedLang && (
                                    <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest border border-orange-500/30 px-2 py-0.5 ml-auto">
                                        Detected: {detectedLang}
                                    </span>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
