import React, { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { getHistory, deleteHistoryItem } from '../lib/db';
import { Trash2, FileText, Type, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const TransliterationHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    try {
      const data = await getHistory(auth.currentUser.uid);
      setHistory(data);
    } catch (err: any) {
      console.error("Archive fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [auth.currentUser]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 border-r-orange-500 rounded-none animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Log Archive...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="max-w-md p-10 bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(239,68,68,1)] text-center">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 underline decoration-red-500 decoration-4">Access Restricted</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-normal mb-6">
          We couldn't retrieve your history. This might be due to a temporary storage issue.
        </p>
        <div className="text-[8px] font-mono text-slate-400 mb-6 break-all">
          Error: {error.message}
        </div>
        <button 
          onClick={() => fetchHistory()}
          className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const filteredHistory = history.filter(item => item.type === 'text');

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="border-b-4 border-slate-900 pb-8">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Recent Session History</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-orange-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Activity Log & Retreival</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHistory.length === 0 ? (
            <div className="md:col-span-2 text-center py-32 bg-white border-2 border-dashed border-slate-200 rounded-none shadow-[8px_8px_0px_0px_rgba(241,245,249,1)]">
              <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center text-slate-200 mx-auto mb-6 border-2 border-slate-200">
                <FileText size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Log Archive is Empty</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const typeIcons = {
                text: <Type size={12} />,
                pdf: <FileText size={12} />,
                image: <ImageIcon size={12} />
              };
              
              const date = new Date(item.timestamp);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-none border-2 border-slate-900 p-6 group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer relative shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    {typeIcons[item.type as keyof typeof typeIcons] || <Type size={12} />}
                                    {item.type}
                                </div>
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                    &rarr; {item.targetLanguage}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 truncate mb-2 leading-none uppercase tracking-tighter">{item.originalText}</h3>
                            <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed italic">{item.transliteratedText}</p>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-orange-500"></div>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    {date.toLocaleTimeString()} • {date.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
