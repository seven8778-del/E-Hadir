import React from 'react';
import { X, Clock, Building, UserCheck, ShieldCheck } from 'lucide-react';
import { Member } from '../types';

interface SelfieModalProps {
  member: Member | null;
  onClose: () => void;
}

export const SelfieModal: React.FC<SelfieModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 z-10 p-2 text-white/90 bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-res image frame */}
        <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center">
          {member.selfieUrl ? (
            <img
              src={member.selfieUrl}
              alt={member.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-500" />
              <p className="text-xs">Tiada fail foto selfie direkodkan.</p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs text-emerald-300 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Foto Sah Di Dewan</span>
          </div>
        </div>

        {/* Member Details */}
        <div className="p-5 space-y-3.5">
          <div>
            <span className="text-[10px] font-semibold text-emerald-950 uppercase tracking-widest block">
              Maklumat Ahli Berdaftar
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{member.fullName}</h3>
            <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
              No. Gaji: {member.staffId}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{member.department}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>Masa Pendaftaran:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">
              {member.attendedAt || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
