import React, { useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Trash2, FileText, Type, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/utils';

export const TransliterationHistory: React.FC = () => {
  const historyQuery = auth.currentUser 
    ? query(
        collection(db, 'history'),
        where('userId', '==', auth.currentUser.uid)
      )
    : null;

  const [value, loading, error] = useCollection(historyQuery);
  
  useEffect(() => {
    if (error) {
      handleFirestoreError(error, OperationType.LIST, 'history');
    }
  }, [error]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'history', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `history/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#5A5A40]/40">Loading history...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading history</div>;

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
          {value?.docs.length === 0 ? (
            <div className="md:col-span-2 text-center py-32 bg-white border-2 border-dashed border-slate-200 rounded-none shadow-[8px_8px_0px_0px_rgba(241,245,249,1)]">
              <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center text-slate-200 mx-auto mb-6 border-2 border-slate-200">
                <FileText size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Log Archive is Empty</p>
            </div>
          ) : (
            value?.docs.map((doc) => {
              const data = doc.data();
              const typeIcons = {
                text: <Type size={12} />,
                pdf: <FileText size={12} />,
                image: <ImageIcon size={12} />
              };

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-none border-2 border-slate-900 p-6 group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer relative shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    {typeIcons[data.type as keyof typeof typeIcons] || <Type size={12} />}
                                    {data.type}
                                </div>
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                    &rarr; {data.targetLanguage}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 truncate mb-2 leading-none uppercase tracking-tighter">{data.originalText}</h3>
                            <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed italic">{data.transliteratedText}</p>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-orange-500"></div>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    {data.timestamp?.toDate().toLocaleTimeString()} • {data.timestamp?.toDate().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={(e) => handleDelete(doc.id, e)}
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
