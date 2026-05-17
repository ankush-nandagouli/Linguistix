import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { deleteUser, signOut } from 'firebase/auth';
import { User, Mail, ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { clearUserHistory } from '../lib/db';

export const UserProfile: React.FC = () => {
    const [user] = useAuthState(auth);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;
        
        setIsDeleting(true);
        try {
            // 1. Delete user data from IndexedDB
            await clearUserHistory(user.uid);

            // 2. Delete user account from Firebase Auth
            await deleteUser(user);
            
            // 3. Sign out just in case
            await signOut(auth);
        } catch (error: any) {
            console.error("Account deletion error:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("Please re-authenticate (sign out and in again) to delete your account.");
            } else {
                alert("An error occurred while deleting your account. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="border-b-4 border-slate-900 pb-8">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Command Profile</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-orange-500"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">User Credentials & Security</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-900 p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] relative">
                    <div className="absolute -top-4 right-8 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                        Status: Active
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-24 h-24 bg-orange-500 border-4 border-slate-900 flex items-center justify-center rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                            <span className="text-white font-black text-4xl">
                                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 border border-slate-200">
                                        <User size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Designation</p>
                                        <p className="text-xl font-bold text-slate-900">{user.displayName || 'Not Provided'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 border border-slate-200">
                                        <Mail size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Signal</p>
                                        <p className="text-xl font-bold text-slate-900">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                        <ShieldAlert size={12} />
                                        Hazard Zone
                                    </p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        Deleting your profile will permanently erase all transliteration history, saved sessions, and biometric mapping. This action is irreversible.
                                    </p>
                                </div>

                                {!confirmDelete ? (
                                    <button 
                                        onClick={() => setConfirmDelete(true)}
                                        className="inline-flex items-center gap-3 px-6 py-4 border-2 border-red-200 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:border-red-500 transition-all group"
                                    >
                                        <Trash2 size={16} />
                                        Initiate Self-Destruct
                                    </button>
                                ) : (
                                    <div className="p-6 bg-red-50 border-2 border-red-500 flex flex-col gap-5">
                                        <p className="font-bold text-red-700 text-xs uppercase tracking-tight text-center">Are you absolutely certain? This operation cannot be undone.</p>
                                        <div className="flex gap-4">
                                            <button 
                                                disabled={isDeleting}
                                                onClick={handleDeleteAccount}
                                                className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Yes, Wipe Everything'}
                                            </button>
                                            <button 
                                                disabled={isDeleting}
                                                onClick={() => setConfirmDelete(false)}
                                                className="flex-1 py-4 bg-white border-2 border-slate-900 text-slate-900 font-black uppercase text-[10px] tracking-widest"
                                            >
                                                Abort
                                            </button>
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
