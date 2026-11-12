import React from 'react';
import { Lock, Monitor, ShieldCheck, ArrowRight } from 'lucide-react';
import { SessionSettings } from '../types';

interface HeaderProps {
  settings: SessionSettings;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onExitAdmin: () => void;
  onOpenHallScreen: () => void;
  isFirebaseActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  onOpenAdminLogin,
  onExitAdmin,
  onOpenHallScreen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Wordmark & Session Context */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden"
              onClick={(e) => {
                if (isAdmin) {
                  e.preventDefault();
                  onExitAdmin();
                }
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-emerald-950 font-sans block leading-none">
                  e-Hadir
                </span>
                <span className="text-[11px] text-slate-500 font-medium tracking-tight">
                  Pengurusan Kehadiran Sahih
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: Quiet Session Context & Status Indicator (No Pills) */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 truncate">
            <span className="font-medium text-slate-900 truncate max-w-sm">
              {settings.meetingTitle}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-slate-500">{settings.meetingDate}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span
              className={`font-semibold ${
                settings.isRegistrationOpen ? 'text-emerald-800' : 'text-rose-700'
              }`}
            >
              {settings.isRegistrationOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
            </span>
          </div>

          {/* Zone 3: Functional Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenHallScreen}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px]"
              title="Paparan Skrin Dewan / Projektor"
            >
              <Monitor className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Skrin Dewan</span>
            </button>

            {isAdmin ? (
              <button
                onClick={onExitAdmin}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors min-h-[36px]"
              >
                <span>Keluar Urus Setia</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-lg transition-colors min-h-[36px] shadow-xs active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-200" />
                <span>Urus Setia</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
