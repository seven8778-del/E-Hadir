import React, { useEffect } from 'react';
import { CheckCircle2, UserCheck, Calendar, Clock, Building, Printer, UserPlus, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, SessionSettings } from '../types';
import { generateVerificationCode } from '../utils/formatters';

interface DigitalPassProps {
  member: Member;
  settings: SessionSettings;
  onRegisterNext: () => void;
  isDuplicateNotice?: boolean;
}

export const DigitalPass: React.FC<DigitalPassProps> = ({
  member,
  settings,
  onRegisterNext,
  isDuplicateNotice = false,
}) => {
  const verificationCode = generateVerificationCode(
    member.staffId,
    member.attendedAt || settings.meetingDate
  );

  useEffect(() => {
    if (!isDuplicateNotice) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#065f46', '#047857', '#10b981', '#ffffff'],
        });
      } catch (e) {
        // confetti optional
      }
    }
  }, [isDuplicateNotice]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Duplicate Notice Banner if opened via Duplicate Detection */}
      {isDuplicateNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <UserCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Kehadiran Sah Telah Direkodkan</p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              No. Gaji ini telah selesai mendaftar. Berikut ialah salinan sah Pas Kehadiran Digital dewan:
            </p>
          </div>
        </div>
      )}

      {/* Main Authoritative Digital Pass */}
      <div className="bg-white rounded-2xl border-2 border-emerald-900 shadow-lg overflow-hidden relative print:border print:shadow-none">
        {/* Subtle Security Texture Overlay */}
        <div className="absolute inset-0 security-pattern pointer-events-none" />

        {/* Pass Official Header */}
        <div className="bg-emerald-950 text-white p-5 border-b-2 border-emerald-700 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center border border-emerald-600/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  Pas Kehadiran Rasmi Dewan
                </span>
                <span className="font-sans font-extrabold text-sm tracking-tight text-white block">
                  AKREDITASI KEHADIRAN FIZIKAL
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-900/90 px-2 py-0.5 rounded border border-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAH</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-200/90 mt-2 truncate font-medium">
            {settings.meetingTitle}
          </p>
        </div>

        {/* Pass Body Content */}
        <div className="p-6 space-y-5 relative">
          {/* Member Photo & Serial Block */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-100 shadow-xs">
                {member.selfieUrl ? (
                  <img
                    src={member.selfieUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[10px]">
                    <UserCheck className="w-7 h-7 text-slate-400 mb-1" />
                    <span>Tiada Foto</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-900 text-white rounded-md p-1 border border-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Kod Pengesahan Sistem
              </span>
              <p className="font-mono text-base font-black text-slate-900 tracking-wider">
                {verificationCode}
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{settings.meetingDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span className="font-mono font-bold text-emerald-950">{member.attendedAt || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Details Ledger */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 divide-y divide-slate-200/70 text-xs">
            <div className="p-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Nama Penuh Ahli
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                {member.fullName}
              </p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200/70">
              <div className="p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  No. Gaji / No. Ahli
                </span>
                <p className="text-xs font-mono font-bold text-emerald-950 mt-0.5">
                  {member.staffId}
                </p>
              </div>

              <div className="p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Status Pengesahan
                </span>
                <span className="text-xs font-bold text-emerald-900 mt-0.5 inline-block">
                  Hadir Fizikal Sah
                </span>
              </div>
            </div>

            <div className="p-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Bahagian / Cawangan
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-slate-800">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{member.department}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Tunjukkan pas ini kepada urus setia pintu masuk untuk semakan kuorum dan akses dewan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2.5 print:hidden">
          {/* Primary Action for Kiosk Tablet flow */}
          <button
            onClick={onRegisterNext}
            type="button"
            className="w-full h-12 rounded-xl bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-200" />
            <span>Daftar Ahli Seterusnya</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="w-full h-10 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak / Simpan PDF Pas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
