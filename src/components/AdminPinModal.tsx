import React, { useState } from 'react';
import { Lock, X, Delete, ShieldAlert } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      setErrorMessage('');

      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const verifyPin = (entered: string) => {
    if (entered === correctPin) {
      try {
        sessionStorage.setItem('ehadir_admin_session', 'true');
      } catch (e) {
        // storage fallback
      }
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('Kod PIN tidak sah. Sila cuba lagi.');
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-950 text-white flex items-center justify-center mb-2.5 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-300" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 font-sans">
            Akses Urus Setia
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Masukkan Kod PIN Pentadbir 6-digit untuk membuka papan pemuka.
          </p>
        </div>

        {/* PIN Indicators (6 circles) */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-rose-600 scale-110'
                    : isFilled
                    ? 'bg-emerald-900 scale-110'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-rose-800 animate-in shake duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-13 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-mono text-lg font-bold transition-colors flex items-center justify-center cursor-pointer border border-slate-200/80"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            Kosongkan
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-mono text-lg font-bold transition-colors flex items-center justify-center cursor-pointer border border-slate-200/80"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Undur satu digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Kod PIN Lalai: <span className="font-mono font-bold text-slate-600">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
};
