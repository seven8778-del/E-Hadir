import React, { useState } from 'react';
import { X, Cloud, HardDrive, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { FirebaseConfig } from '../types';
import { storageService } from '../services/storage';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const existing = storageService.getFirebaseConfig();

  const [apiKey, setApiKey] = useState(existing?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(existing?.authDomain || '');
  const [projectId, setProjectId] = useState(existing?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(existing?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(existing?.messagingSenderId || '');
  const [appId, setAppId] = useState(existing?.appId || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      storageService.saveFirebaseConfig(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    storageService.saveFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setStorageBucket('');
    setMessagingSenderId('');
    setAppId('');
    storageService.saveFirebaseConfig(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const isConnected = !!(existing && existing.apiKey && existing.projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-sans">
              Pangkalan Data Cloud (Firebase)
            </h2>
            <p className="text-xs text-slate-500">
              Penyelarasan Firestore & Cloud Storage merentas peranti dewan
            </p>
          </div>
        </div>

        {/* Current Engine Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Status Sambungan Semasa
          </span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-950">
                  Firebase Cloud Terhubung ({existing?.projectId})
                </span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-emerald-800" />
                <span className="text-xs font-bold text-slate-800">
                  Storan Tempatan (Mod Real-Time Sedia Ada Aktif)
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            {isConnected
              ? 'Data kehadiran dan fail imej diselaraskan terus ke projek Firebase Firestore & Cloud Storage anda.'
              : 'Sistem sedang beroperasi dalam mod storan selamat terbina dengan penyelarasan masa nyata merentas tab. Anda boleh memasukkan kredensial Firebase di bawah bila bersedia.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Konfigurasi berjaya dikemas kini!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Firebase Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="contoh: ehadir-mesyuarat-2026"
              className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Web API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="ehadir.firebaseapp.com"
                className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="ehadir.appspot.com"
                className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gunakan Mod Tempatan Sahaja</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
