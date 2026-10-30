import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Smartphone, RefreshCw, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

interface MFAPageProps {
  onNavigate: (page: string) => void;
}

export const MFAPage: React.FC<MFAPageProps> = ({ onNavigate }) => {
  const { verifyMfa, role } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus();

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    // Auto advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the authentication OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyMfa(code);
      if (role === 'SUPER_ADMIN') onNavigate('super-admin');
      else if (role === 'REGULATION_OFFICER') onNavigate('regulation-bureau');
      else if (role === 'INSTITUTION_ADMIN') onNavigate('institution-dashboard');
      else if (role === 'STUDENT') onNavigate('student-dashboard');
      else onNavigate('institution-dashboard');
    } catch (err: any) {
      setError(err.message || 'MFA validation failed. Check OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setDigits(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-cyan-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to login</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 flex items-center justify-center">
            <Smartphone className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Second-Factor Authentication (2FA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A 6-digit one-time code has been dispatched to your authorized AICTE administrative channel.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Code expires in: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{timer}s</strong></span>
            <button
              type="button"
              disabled={timer > 0}
              onClick={() => setTimer(60)}
              className="text-cyan-600 dark:text-cyan-400 font-semibold disabled:opacity-40 hover:underline"
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-sm shadow-md shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Validate & Grant Access</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            type="button"
            onClick={handleQuickFillDemo}
            className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            Click here to Auto-Fill Demo OTP (123456)
          </button>
        </div>

      </div>
    </div>
  );
};
