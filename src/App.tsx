/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Monitor, QrCode } from 'lucide-react';
import { storageService } from './services/storage';
import { Member, SessionSettings } from './types';
import { Header } from './components/Header';
import { MemberRegistration } from './components/MemberRegistration';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminPinModal } from './components/AdminPinModal';
import { HallScreenModal } from './components/HallScreenModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { QrModal } from './components/QrModal';

export default function App() {
  const [settings, setSettings] = useState<SessionSettings>(() => storageService.getSettings());
  const [members, setMembers] = useState<Member[]>(() => storageService.getAllMembers());

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ehadir_admin_session') === 'true';
    }
    return false;
  });

  const [activeView, setActiveView] = useState<'member' | 'admin'>('member');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showHallScreenModal, setShowHallScreenModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Subscribe to real-time updates from storage service (across tabs and components)
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setSettings(storageService.getSettings());
      setMembers(storageService.getAllMembers());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenAdminLogin = () => {
    if (isAdminLoggedIn) {
      setActiveView('admin');
    } else {
      setShowPinModal(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowPinModal(false);
    setActiveView('admin');
  };

  const handleExitAdmin = () => {
    try {
      sessionStorage.removeItem('ehadir_admin_session');
    } catch (e) {
      // storage
    }
    setIsAdminLoggedIn(false);
    setActiveView('member');
  };

  const isFirebaseActive = storageService.isFirebaseConnected();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        settings={settings}
        isAdmin={isAdminLoggedIn && activeView === 'admin'}
        onOpenAdminLogin={handleOpenAdminLogin}
        onExitAdmin={handleExitAdmin}
        onOpenHallScreen={() => setShowHallScreenModal(true)}
        onOpenQrModal={() => setShowQrModal(true)}
        isFirebaseActive={isFirebaseActive}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center">
        {isAdminLoggedIn && activeView === 'admin' ? (
          <AdminDashboard
            settings={settings}
            members={members}
            onOpenHallScreen={() => setShowHallScreenModal(true)}
            onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
            onSwitchToKiosk={() => setActiveView('member')}
            onOpenQrModal={() => setShowQrModal(true)}
          />
        ) : (
          <MemberRegistration
            settings={settings}
            onOpenAdminLogin={handleOpenAdminLogin}
          />
        )}
      </main>

      {/* Institutional Quiet Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-900" />
            <span className="font-bold text-slate-800">e-Hadir</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Sistem Kehadiran Mesyuarat Agung & Kiosk</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => setShowQrModal(true)}
              type="button"
              className="hover:text-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer font-medium text-emerald-950"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-800" />
              <span>Kod QR Pendaftaran</span>
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setShowHallScreenModal(true)}
              type="button"
              className="hover:text-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>Paparan Skrin Dewan</span>
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={handleOpenAdminLogin}
              type="button"
              className="hover:text-emerald-900 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-800" />
              <span>Akses Urus Setia</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin PIN Gate Modal */}
      <AdminPinModal
        isOpen={showPinModal}
        correctPin={settings.adminPin}
        onSuccess={handleAdminAuthSuccess}
        onClose={() => setShowPinModal(false)}
      />

      {/* Hall Screen Projector Modal */}
      <HallScreenModal
        isOpen={showHallScreenModal}
        onClose={() => setShowHallScreenModal(false)}
        settings={settings}
        members={members}
      />

      {/* Cloud & Firebase Setup Modal */}
      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />

      {/* Live QR Code Registration Modal */}
      <QrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        settings={settings}
        members={members}
      />
    </div>
  );
}
