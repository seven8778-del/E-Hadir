import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { captureAndCompressFrame, detectCameraEnvironment } from '../utils/camera';

interface CameraCaptureProps {
  staffId: string;
  fullName: string;
  onPhotoCaptured: (dataUrl: string, sizeInKB: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submissionError?: string | null;
  onRetrySubmit?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  staffId,
  fullName,
  onPhotoCaptured,
  onCancel,
  isSubmitting,
  submissionError,
  onRetrySubmit,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageSizeKB, setImageSizeKB] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize Camera stream
  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);

    const env = detectCameraEnvironment();
    if (!env.isSupported) {
      setCameraError(env.errorMessage || 'Kamera tidak disokong pada pelayar ini.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Kebenaran kamera disekat. Sila benarkan akses kamera dalam tetapan pelayar anda untuk meneruskan pendaftaran.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Tiada perkakasan kamera dikesan pada peranti ini.');
      } else {
        setCameraError(
          'Kamera tidak dapat diakses. Sila buka pautan ini menggunakan pelayar Google Chrome atau Apple Safari.'
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !cameraReady) return;
    try {
      setIsCapturing(true);
      const result = await captureAndCompressFrame(videoRef.current, 640, 0.7);
      setCapturedImage(result.dataUrl);
      setImageSizeKB(result.sizeInKB);
      stopCamera();
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setImageSizeKB(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage && imageSizeKB !== null) {
      onPhotoCaptured(capturedImage, imageSizeKB);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header Context */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-emerald-900 tracking-wider uppercase block">
            Langkah 2 daripada 2: Foto Kehadiran
          </span>
          <h2 className="text-base font-bold text-slate-900 truncate">{fullName}</h2>
          <p className="text-xs text-slate-500 font-mono">No. Gaji: {staffId}</p>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          disabled={isSubmitting}
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center">
        {/* If Camera Error */}
        {cameraError ? (
          <div className="p-6 text-center text-white space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-medium">{cameraError}</p>
            <button
              onClick={startCamera}
              type="button"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cuba Sekali Lagi
            </button>
          </div>
        ) : capturedImage ? (
          /* Preview captured photo */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Pratonton Selfie"
              className="w-full h-full object-cover"
            />
            {imageSizeKB !== null && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-xs text-[11px] text-emerald-300 font-mono py-1 px-2.5 rounded-lg text-center border border-white/10">
                Foto Disahkan: {imageSizeKB} KB (&lt;150KB)
              </div>
            )}
          </div>
        ) : (
          /* Live Stream */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover camera-mirror"
            />

            {/* Biometric Viewfinder Reticle & Guides */}
            <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between items-center">
              {/* Corner markings */}
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-sm" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-sm" />
              </div>

              {/* Centered Face Guide Oval */}
              <div className="w-44 h-56 border border-emerald-400/50 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
              </div>

              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-sm" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 rounded-br-sm" />
              </div>
            </div>

            <div className="absolute top-3 text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full pointer-events-none border border-white/10">
              Posisikan wajah anda dalam bingkai
            </div>

            {!cameraReady && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs text-slate-300">Menyambungkan kamera hadapan...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Submission Error Banner with Retry (BR-04) */}
      {submissionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Gangguan Penghantaran</p>
            <p className="mt-0.5 text-rose-700">{submissionError}</p>
            {onRetrySubmit && capturedImage && (
              <button
                onClick={onRetrySubmit}
                type="button"
                className="mt-2 text-xs font-bold text-rose-900 underline hover:no-underline cursor-pointer"
              >
                Cuba Hantar Semula Sekarang
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div>
        {capturedImage ? (
          /* Decision: Retake or Confirm */
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleRetake}
              disabled={isSubmitting}
              type="button"
              className="h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Ambil Semula</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              type="button"
              className="h-12 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Sahkan Kehadiran</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Live Capture Button */
          <div className="flex flex-col items-center">
            <button
              onClick={handleCapture}
              disabled={!cameraReady || isCapturing}
              type="button"
              className="w-16 h-16 rounded-full bg-emerald-900 hover:bg-emerald-950 active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ring-4 ring-emerald-900/10 focus:outline-hidden"
              aria-label="Tangkap Foto Selfie"
            >
              <Camera className="w-7 h-7" />
            </button>
            <span className="mt-2.5 text-xs font-bold text-slate-700">
              Tekan untuk merakam foto kehadiran
            </span>
            <p className="mt-0.5 text-[11px] text-slate-400 text-center">
              Wajib ditangkap secara langsung sebagai bukti kehadiran dewan fizikal
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
