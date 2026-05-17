import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { LogOut, History, Languages, FileText, Camera, Menu, X, WifiOff, Download } from 'lucide-react';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'text' | 'pdf' | 'image' | 'history' | 'profile';
  onViewChange: (view: 'text' | 'pdf' | 'image' | 'history' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    const promptHandler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const menuItems = [
    { id: 'text', icon: Languages, label: 'Text' },
    { id: 'pdf', icon: FileText, label: 'PDF' },
    { id: 'image', icon: Camera, label: 'Visuals' },
    { id: 'history', icon: History, label: 'Archive' },
  ];

  const handleNavClick = (id: any) => {
    onViewChange(id);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-50 shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-orange-500 w-8 h-8 flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-xl">L</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Linguistix</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-slate-900 border-2 border-slate-900 bg-white active:scale-95 transition-transform"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Nav (Desktop + Mobile Overlay) */}
      <aside className={`
        fixed inset-0 bg-white z-40 transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-72 md:bg-white border-r border-slate-200 md:h-full flex-col
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-2 mb-10">
            <div className="bg-orange-500 w-10 h-10 flex items-center justify-center rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-2xl">L</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Linguistix</h1>
          </div>

          <nav className="space-y-4 pt-10 md:pt-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 px-1">Navigation Hub</p>
            {menuItems.map((item) => (
               <button
                key={item.id}
                onClick={() => handleNavClick(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all font-black uppercase text-[11px] tracking-widest border-2 ${
                  activeView === item.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]' 
                    : 'bg-white text-slate-400 border-transparent hover:border-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            {deferredPrompt && (
               <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-3 py-4 mb-6 bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
               >
                 <Download size={14} />
                 Install Native Suite
               </button>
            )}
            {user && (
              <button 
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center gap-4 mb-6 p-4 border-2 transition-all group ${activeView === 'profile' ? 'bg-orange-50 border-orange-500 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <div className="w-10 h-10 bg-slate-50 border-2 border-slate-200 rounded-none flex items-center justify-center text-slate-400 font-bold shadow-sm group-hover:bg-orange-500 group-hover:text-white group-hover:border-slate-900 transition-colors">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-orange-500">View Profile</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                </div>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-white text-slate-900 text-[10px] border-2 border-slate-900 font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        {isOffline && (
            <div className="bg-red-600 text-white px-6 py-2 flex items-center justify-between z-30 shadow-lg">
                <div className="flex items-center gap-3">
                    <WifiOff size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Offline Mode Active • Local Engines Only</span>
                </div>
                <div className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">Syncing history suspended</div>
            </div>
        )}
        {children}
      </main>
    </div>
  );
};

