import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { TextTransliteration } from './components/TextTransliteration';
import { PDFTransliteration } from './components/PDFTransliteration';
import { ImageTransliteration } from './components/ImageTransliteration';
import { TransliterationHistory } from './components/TransliterationHistory';
import { UserProfile } from './components/UserProfile';
import { motion, AnimatePresence } from 'motion/react';
import { warmupEngine } from './services/offline';

type ViewType = 'text' | 'pdf' | 'image' | 'history' | 'profile';

function App() {
  const [user, loading] = useAuthState(auth);
  const [activeView, setActiveView] = useState<ViewType>('text');

  useEffect(() => {
    warmupEngine();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 border-r-orange-500 animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Initializing Engine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'text': return <TextTransliteration />;
      case 'pdf': return <PDFTransliteration />;
      case 'image': return <ImageTransliteration />;
      case 'history': return <TransliterationHistory />;
      case 'profile': return <UserProfile />;
      default: return <TextTransliteration />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;

