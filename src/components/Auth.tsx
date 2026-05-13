import React from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Languages, Shield, Zap, Globe, FileText, Camera } from 'lucide-react';

export const Auth: React.FC = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-[8vh] pb-20 px-6 font-sans overflow-y-auto">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           className="space-y-10"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 w-12 h-12 flex items-center justify-center rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-3xl">L</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">Linguistix</h1>
          </div>

          <h2 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase">
            Map any sound to <span className="text-orange-500 italic">native script.</span>
          </h2>

          <p className="text-xl font-bold uppercase tracking-widest text-slate-400 max-w-md leading-relaxed">
            Revolutionary phonetic engine for Indian scripts. Zero latency. 100% preservation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={handleGoogleLogin}
              className="px-10 py-6 bg-slate-900 text-white font-black uppercase text-sm tracking-[0.2em] shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 invert" />
              Begin Transmission
            </button>
            <div className="flex items-center gap-4 px-6 border-l-4 border-slate-900">
               <div className="animate-pulse w-3 h-3 bg-green-500"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Network Status: Online & Secured</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-4"
        >
            <div className="bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <Languages className="text-orange-500 mb-6" size={32} />
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Automated Detection</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Engine detects source language phonemes instantly.</p>
            </div>
            <div className="bg-slate-900 border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] text-white translate-y-8">
                <Camera className="text-orange-500 mb-6" size={32} />
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Visual OCR</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Layer transliterations directly over sign boards.</p>
            </div>
            <div className="bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] -translate-y-4">
                <FileText className="text-orange-500 mb-6" size={32} />
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">PDF Pipeline</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Complete document script conversion with downloads.</p>
            </div>
            <div className="bg-orange-500 border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-white translate-y-4">
                <Zap className="text-white mb-6" size={32} />
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Offline Mode</h3>
                <p className="text-[10px] font-black text-black/40 uppercase leading-relaxed">Aksharmukha integration for zero-connectivity use.</p>
            </div>
        </motion.div>
      </div>

      {/* Trust Bar */}
      <div className="mt-40 border-t-4 border-slate-900 pt-10 flex flex-wrap gap-12 items-center justify-center grayscale opacity-30">
          <span className="font-black text-2xl tracking-tighter uppercase px-4 border-2 border-slate-900">Devanagari</span>
          <span className="font-black text-2xl tracking-tighter uppercase px-4 border-2 border-slate-900">Bengali</span>
          <span className="font-black text-2xl tracking-tighter uppercase px-4 border-2 border-slate-900">Gurmukhi</span>
          <span className="font-black text-2xl tracking-tighter uppercase px-4 border-2 border-slate-900">Malayalam</span>
      </div>
    </div>
  );
};

