import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Maximize2, Minimize2, Users, ShieldCheck, QrCode } from 'lucide-react';
import { SessionSettings, Member } from '../types';

interface HallScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SessionSettings;
  members: Member[];
}

export const HallScreenModal: React.FC<HallScreenModalProps> = ({
  isOpen,
  onClose,
  settings,
  members,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const attendedCount = members.filter((m) => m.hasAttended).length;
  const totalEligible = members.length || 1;
  const percentage = Math.round((attendedCount / totalEligible) * 1000) / 10;
  const isQuorumReached = percentage >= settings.quorumTargetPercent;

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#022c22',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-12 overflow-y-auto">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-700/50 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-semibold block">
              Paparan Skrin Utama Dewan Mesyuarat
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate max-w-xl">
              {settings.meetingTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Skrin Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            type="button"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-8">
        {/* Left: Authoritative QR Code Station */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-emerald-800">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Kod QR Kehadiran"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                <QrCode className="w-16 h-16 animate-pulse text-emerald-600" />
              </div>
            )}
          </div>
          <div className="mt-5 space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Imbas Untuk Rekod Kehadiran (BYOD)
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Buka kamera telefon pintar anda dan halakan ke kod QR di atas.
            </p>
          </div>
        </div>

        {/* Right: Real-time Quorum & Attendance Monitor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`font-semibold ${
                settings.isRegistrationOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {settings.isRegistrationOpen ? '● Pendaftaran Sedang Dibuka' : '● Pendaftaran Telah Ditutup'}
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-400 font-mono">
              Tarikh Sesi: {settings.meetingDate}
            </span>
          </div>

          {/* Big Quorum KPI Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Jumlah Kehadiran Fizikal
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-mono font-black text-emerald-400 tabular-nums">
                  {attendedCount}
                </span>
                <span className="text-sm text-slate-500 font-mono">/ {totalEligible} Ahli</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Telah disahkan dengan foto live</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Peratusan Kuorum Semasa
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-mono font-black text-white tabular-nums">
                  {percentage}%
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  (Sasaran {settings.quorumTargetPercent}%)
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Kehadiran berbanding keseluruhan</p>
            </div>
          </div>

          {/* Quorum Progress Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Status Pencapaian Kuorum Dewan</span>
              <span
                className={`font-bold ${
                  isQuorumReached ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isQuorumReached ? 'KUORUM TERCAPAI' : 'BELUM MENCAPAI KUORUM'}
              </span>
            </div>

            <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isQuorumReached ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
                style={{ left: `${settings.quorumTargetPercent}%` }}
                title={`Sasaran: ${settings.quorumTargetPercent}%`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0%</span>
              <span className="text-slate-400 font-semibold">Sasaran Minima Perlembagaan: {settings.quorumTargetPercent}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
