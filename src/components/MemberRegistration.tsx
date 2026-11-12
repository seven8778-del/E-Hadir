import React, { useState, useCallback } from 'react';
import {
  Search,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  Building,
  XCircle,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Member, MemberLocation, RegistrationStep, SessionSettings } from '../types';
import { storageService } from '../services/storage';
import { normalizeStaffId } from '../utils/formatters';
import { getCurrentBrowserLocation } from '../utils/geolocation';
import { CameraCapture } from './CameraCapture';
import { DigitalPass } from './DigitalPass';

interface MemberRegistrationProps {
  settings: SessionSettings;
  onOpenAdminLogin: () => void;
}

export const MemberRegistration: React.FC<MemberRegistrationProps> = ({
  settings,
  onOpenAdminLogin,
}) => {
  const [step, setStep] = useState<RegistrationStep>('check-id');
  const [inputStaffId, setInputStaffId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [pendingSelfie, setPendingSelfie] = useState<string | null>(null);

  // Background Geolocation state (recorded silently for Secretariat audit)
  const [liveLocation, setLiveLocation] = useState<MemberLocation | null>(null);

  // Acquire browser location silently in background for Urus Setia
  const handleDetectLocation = useCallback(async () => {
    try {
      const res = await getCurrentBrowserLocation(
        settings.venueLat,
        settings.venueLng,
        settings.geofenceRadiusMeters || 500
      );
      if (res.location) {
        setLiveLocation(res.location);
      }
    } catch (e) {
      // Handled silently - attendance is not blocked
    }
  }, [settings.venueLat, settings.venueLng, settings.geofenceRadiusMeters]);

  // Reset form back to Step 1 (for tablet kiosk flow or manual reset)
  const handleReset = () => {
    setStep('check-id');
    setInputStaffId('');
    setErrorMessage(null);
    setCurrentMember(null);
    setIsSubmitting(false);
    setSubmissionError(null);
    setPendingSelfie(null);
    setLiveLocation(null);
  };

  // Step 1: Verify Staff ID (FR-002, FR-003, BR-01)
  const handleCheckStaffId = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const normalized = normalizeStaffId(inputStaffId);
    if (!normalized) {
      setErrorMessage('Sila masukkan No. Gaji atau No. Kakitangan anda.');
      return;
    }

    // Check if session is closed
    if (!settings.isRegistrationOpen) {
      setErrorMessage('Pendaftaran kehadiran telah ditutup. Sila rujuk meja urus setia.');
      return;
    }

    const member = storageService.findMemberByStaffId(normalized);

    if (!member) {
      setErrorMessage(
        'No. Gaji tidak ditemui dalam senarai ahli layak. Sila semak semula atau rujuk meja urus setia.'
      );
      return;
    }

    // FR-003: Duplicate prevention
    if (member.hasAttended) {
      setCurrentMember(member);
      setStep('already-attended');
      return;
    }

    // Member found and eligible
    setCurrentMember(member);
    setStep('confirm-profile');
    // Start locating attendee seamlessly
    handleDetectLocation();
  };

  // Step 2 -> Step 3: Go to live camera
  const handleProceedToCamera = () => {
    setStep('camera');
  };

  // Step 3: Photo captured, proceed to record attendance
  const handlePhotoCaptured = async (selfieDataUrl: string) => {
    if (!currentMember) return;
    setPendingSelfie(selfieDataUrl);
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const result = storageService.recordAttendance(
        currentMember.staffId,
        selfieDataUrl,
        liveLocation
      );

      if (result.success && result.member) {
        setCurrentMember(result.member);
        setStep('success-pass');
      } else {
        setSubmissionError(result.error || 'Gagal menyimpan rekod kehadiran.');
      }
    } catch (err: any) {
      setSubmissionError(
        'Ralat sambungan semasa menghantar data. Sila tekan "Cuba Hantar Semula".'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry submission without retaking photo (BR-04)
  const handleRetrySubmit = async () => {
    if (pendingSelfie && currentMember) {
      handlePhotoCaptured(pendingSelfie);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12">
      {/* Session Header Section */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1.5">
          Pendaftaran Kehadiran Mesyuarat
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {settings.meetingTitle}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500 font-medium">
          <span>Tarikh: {settings.meetingDate}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Kaunter Rasmi & BYOD</span>
        </div>
      </div>

      {/* Official Session Closed Banner (FR-001) */}
      {!settings.isRegistrationOpen && (
        <div className="mb-6 p-6 bg-white border border-rose-200 rounded-2xl shadow-xs text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Pendaftaran Kehadiran Ditutup</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Sesi pendaftaran telah ditutup oleh urus setia. Sila ke meja urus setia untuk bantuan manual.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenAdminLogin}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline underline-offset-4"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Log Masuk Urus Setia</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Search Staff ID (FR-002) */}
      {step === 'check-id' && settings.isRegistrationOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Masukkan No. Gaji</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sila masukkan nombor gaji atau nombor keahlian anda untuk semakan senarai induk dewan.
            </p>
          </div>

          <form onSubmit={handleCheckStaffId} className="space-y-4">
            <div>
              <label
                htmlFor="staffIdInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                No. Gaji / No. Kakitangan
              </label>
              <input
                id="staffIdInput"
                type="text"
                autoFocus
                autoComplete="off"
                value={inputStaffId}
                onChange={(e) => {
                  setInputStaffId(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="cth: LGM1001"
                className="w-full h-13 px-4 text-lg font-mono font-bold tracking-wider uppercase text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 focus:outline-hidden transition-all"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Huruf kecil atau besar akan diselaraskan secara automatik.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-200" />
              <span>Semak Kelayakan</span>
            </button>
          </form>

          {/* Clean sample helper strip for reviewer ease */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-2 font-medium">
              Contoh No. Gaji dalam pangkalan data untuk ujian:
            </span>
            <div className="flex flex-wrap gap-2">
              {['LGM1001', 'LGM1002', 'LGM1003', 'LGM1005'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setInputStaffId(id);
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 text-xs font-mono font-medium text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Confirm Identity Profile Card */}
      {step === 'confirm-profile' && currentMember && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold text-emerald-900 tracking-wider uppercase block mb-1">
              Langkah 1 daripada 2: Pengesahan
            </span>
            <h2 className="text-lg font-bold text-slate-900">Sahkan Identiti Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sila pastikan maklumat di bawah sepadan dengan identiti anda sebelum mengambil foto kehadiran.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3.5">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Nama Penuh Ahli
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{currentMember.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/80">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  No. Gaji
                </span>
                <p className="text-sm font-mono font-bold text-emerald-950 mt-0.5">
                  {currentMember.staffId}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Status Kelayakan
                </span>
                <span className="text-xs font-bold text-emerald-800 mt-1 inline-block">
                  Layak Mendaftar
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Bahagian / Cawangan
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentMember.department}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleProceedToCamera}
              type="button"
              className="w-full h-12 rounded-xl bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Teruskan ke Kamera Hadapan</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>

            <button
              onClick={handleReset}
              type="button"
              className="w-full h-10 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Bukan Saya (Tukar No. Gaji)
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Live Camera Capture */}
      {step === 'camera' && currentMember && (
        <CameraCapture
          staffId={currentMember.staffId}
          fullName={currentMember.fullName}
          onPhotoCaptured={handlePhotoCaptured}
          onCancel={() => setStep('confirm-profile')}
          isSubmitting={isSubmitting}
          submissionError={submissionError}
          onRetrySubmit={handleRetrySubmit}
        />
      )}

      {/* Submitting state overlay fallback */}
      {step === 'submitting' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-900 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Menyimpan Rekod Kehadiran...</h3>
          <p className="text-xs text-slate-500">
            Foto selfie sedang dimampatkan (&lt;150KB) dan diselaraskan ke pangkalan data dewan.
          </p>
        </div>
      )}

      {/* STEP 4: Success Digital Pass */}
      {step === 'success-pass' && currentMember && (
        <DigitalPass
          member={currentMember}
          settings={settings}
          onRegisterNext={handleReset}
        />
      )}

      {/* Duplicate Attendance Notice with Original Pass (FR-003) */}
      {step === 'already-attended' && currentMember && (
        <DigitalPass
          member={currentMember}
          settings={settings}
          onRegisterNext={handleReset}
          isDuplicateNotice={true}
        />
      )}
    </div>
  );
};
