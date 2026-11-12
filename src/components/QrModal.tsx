import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  Radio,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Users,
} from 'lucide-react';
import { SessionSettings, Member } from '../types';
import { storageService } from '../services/storage';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SessionSettings;
  members: Member[];
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  settings,
  members,
}) => {
  const [qrMode, setQrMode] = useState<'general' | 'member'>('general');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize baseUrl from window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + window.location.pathname;
      setCustomBaseUrl(url);
    }
  }, [isOpen]);

  // Construct effective URL for the QR code
  const effectiveUrl = React.useMemo(() => {
    const base = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    if (qrMode === 'member' && selectedStaffId.trim()) {
      const separator = base.includes('?') ? '&' : '?';
      return `${base}${separator}staffId=${encodeURIComponent(selectedStaffId.trim())}`;
    }
    return base;
  }, [customBaseUrl, qrMode, selectedStaffId]);

  // Generate QR Code data URL whenever effectiveUrl changes
  useEffect(() => {
    if (!isOpen || !effectiveUrl) return;

    QRCode.toDataURL(
      effectiveUrl,
      {
        width: 360,
        margin: 2,
        color: {
          dark: '#064e3b', // Deep emerald
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, effectiveUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveUrl);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ehadir-qr-${qrMode === 'member' ? selectedStaffId : 'dewan'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintPoster = () => {
    window.print();
  };

  const isLive = storageService.isLiveConnected();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Printable Poster Section (only visible during window.print) */}
      <div className="hidden print:block print:w-full print:max-w-2xl print:mx-auto print:p-8 print:bg-white print:text-black">
        <div className="text-center border-b-2 border-emerald-900 pb-6 mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-extrabold text-2xl tracking-tight text-emerald-950">
              e-Hadir
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-semibold text-slate-700">
              Sistem Pendaftaran Kehadiran Mesyuarat
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {settings.meetingTitle}
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            Tarikh: {settings.meetingDate} | Lokasi: {settings.venueName}
          </p>
        </div>

        <div className="text-center my-8">
          <div className="inline-block p-4 border-2 border-slate-300 rounded-2xl bg-white shadow-xs">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Kod QR Pendaftaran"
                className="w-64 h-64 mx-auto object-contain"
              />
            )}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-3 max-w-md mx-auto break-all">
            {effectiveUrl}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Langkah-Langkah Pendaftaran Ahli:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-800">
            <li>
              Buka aplikasi kamera atau pengimbas QR pada telefon pintar anda dan imbas kod di atas.
            </li>
            <li>
              Masukkan <strong>No. Gaji / No. Ahli</strong> anda untuk semakan kelayakan dewan.
            </li>
            <li>
              Ambil gambar swafoto pengesahan diri dan tekan <strong>Daftar Kehadiran</strong>.
            </li>
            <li>
              Status kehadiran anda akan dikemas kini <strong>secara langsung</strong> pada skrin dewan utama!
            </li>
          </ol>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          Urus Setia Mesyuarat · e-Hadir Rasmi
        </div>
      </div>

      {/* Screen Interactive Modal Container */}
      <div className="print:hidden bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                Kod QR Pendaftaran & Pautan Segerak
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className={isLive ? 'text-emerald-800 font-semibold' : 'text-amber-700'}>
                    {isLive ? 'Segerak Langsung Aktif' : 'Mod Sambungan Tempatan'}
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Kemas kini serta-merta</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Real-time Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
            <Smartphone className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Satu Pautan, Semua Skrin Tersegerak:</strong> Apabila ahli mengimbas QR kod ini
              menggunakan telefon mereka dan merekodkan kehadiran, maklumat kehadiran akan muncul{' '}
              <strong>secara automatik</strong> di komputer riba Urus Setia dan Skrin Projektor Dewan
              tanpa perlu memuat semula halaman (refresh).
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setQrMode('general')}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                qrMode === 'general'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Kod QR Umum Dewan</span>
            </button>
            <button
              type="button"
              onClick={() => setQrMode('member')}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                qrMode === 'member'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kod QR Khusus Ahli</span>
            </button>
          </div>

          {/* Member Selection if in Member Mode */}
          {qrMode === 'member' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih atau Masukkan No. Gaji Ahli:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="cth: LGM1001"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-800"
                />
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-emerald-800 max-w-[180px]"
                >
                  <option value="">-- Pilih dari senarai --</option>
                  {members.map((m) => (
                    <option key={m.staffId} value={m.staffId}>
                      {m.staffId} - {m.fullName.slice(0, 15)}...
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Ahli yang mengimbas kod ini akan terus disahkan tanpa perlu menaip nombor gaji.
              </p>
            </div>
          )}

          {/* QR Code Presentation Box */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50/70 border border-slate-200 rounded-2xl">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Kod QR Pendaftaran e-Hadir"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                  Menjana QR...
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  {qrMode === 'general' ? 'Pendaftaran Terbuka' : `Pendaftaran: ${selectedStaffId || 'Ahli'}`}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {qrMode === 'general' ? 'Imbas & Hadir' : 'Kod Pas Pantas Ahli'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Imbas menggunakan mana-mana telefon pintar dengan kamera biasa.
                </p>
              </div>

              {/* URL Display Box */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider mb-0.5">
                  Pautan Web:
                </span>
                <p className="text-xs font-mono text-slate-700 truncate select-all">
                  {effectiveUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-emerald-800 font-bold">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Pautan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Muat Turun PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPoster}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Cetak Poster Meja</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Urus Setia Dewan · Sesi 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
