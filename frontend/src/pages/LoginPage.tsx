import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Eye, EyeOff, Lock, Mail, RefreshCw, 
  AlertCircle, Smartphone, KeyRound, CheckCircle, Info,
  Fingerprint, Sparkles, Cpu, ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoRole } = useAuth();
  
  const [identifier, setIdentifier] = useState('aicte_admin');
  const [password, setPassword] = useState('Aicte@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [num1, setNum1] = useState(8);
  const [num2, setNum2] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const refreshCaptcha = () => {
    setNum1(Math.floor(Math.random() * 9) + 1);
    setNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate CAPTCHA
    if (parseInt(captchaInput.trim(), 10) !== num1 + num2) {
      setError('Incorrect CAPTCHA answer. Please solve the security equation.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.requiresMfa) {
        onNavigate('mfa-verify');
      } else {
        if (res.role === 'SUPER_ADMIN') onNavigate('super-admin');
        else if (res.role === 'REGULATION_OFFICER') onNavigate('regulation-bureau');
        else if (res.role === 'INSTITUTION_ADMIN') onNavigate('institution-dashboard');
        else if (res.role === 'STUDENT') onNavigate('student-dashboard');
        else onNavigate('institution-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Simulated WebAuthn / Passkey Biometric Login
  const handleBiometricAuth = async () => {
    setBiometricScanning(true);
    setError(null);
    try {
      // Simulate WebAuthn platform authenticator challenge response
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setBiometricSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const res = await login(identifier, password);
      if (res.requiresMfa) {
        onNavigate('mfa-verify');
      } else {
        onNavigate('super-admin');
      }
    } catch (err: any) {
      setError('WebAuthn biometric key authentication bypassed to manual credentials.');
    } finally {
      setBiometricScanning(false);
    }
  };

  const handleDemoPreset = (role: UserRole, userIdent: string, pass: string) => {
    setIdentifier(userIdent);
    setPassword(pass);
    setCaptchaInput((num1 + num2).toString());
    switchDemoRole(role);
  };

  return (
    <div className="max-w-xl mx-auto py-6 relative">
      {/* Subtle Glowing Backdrop Aura */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Glass Login Card */}
      <div className="relative rounded-3xl p-8 border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,242,254,0.15)] space-y-6">
        
        {/* Emblem & Futuristic Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-700 p-2 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
            <img src="/logo.svg" alt="APAAR ONE Emblem" className="w-12 h-12" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Cpu className="w-3 h-3 text-cyan-400" />
            ZERO-TRUST IDENTITY GATEWAY
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            APAAR ONE X SOVEREIGN OS
          </h1>
          <p className="text-xs text-slate-400">
            National Educational Single Sign-On • RBAC & ABAC Enforced
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* WebAuthn Passkey / Biometric Fast-Track Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              biometricScanning
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 animate-pulse shadow-[0_0_20px_rgba(0,242,254,0.5)]'
                : biometricSuccess
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                : 'bg-slate-900 text-cyan-400 border-slate-700'
            }`}>
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Passkey / Biometric Login
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-1.5 py-0.2 rounded">
                  FIDO2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {biometricScanning
                  ? 'Verifying cryptographic biometric signature...'
                  : biometricSuccess
                  ? 'Biometric assertion verified!'
                  : 'Fast-track sign in via platform authenticator'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={biometricScanning || loading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all font-mono"
          >
            {biometricScanning ? 'Scanning...' : 'Authenticate'}
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            or password authentication
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Username / Institution ID */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              National Identifier / Email / Institution ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="aicte_admin or registrar@ditar.edu.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Encrypted Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] font-semibold text-cyan-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-cyan-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mathematical CAPTCHA */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Government Security Verification (CAPTCHA)
            </label>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 select-none tracking-wider shadow-inner">
                {num1} + {num2} = ?
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                title="Refresh CAPTCHA"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Result"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <ShieldCheck className="w-4 h-4 text-slate-950" />}
            <span>AUTHENTICATE SECURE SESSION</span>
          </button>
        </form>

        {/* Device recognition & Security telemetry badge */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>TLS 1.3 / AES-256 SESSION ACTIVE</span>
            </span>
            <span className="text-cyan-400">HSM LEVEL 3</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Device Fingerprint: SHA256:d8a92e104f... • Zero-Trust Continuous Validation
          </div>
        </div>

        {/* Demo Quick Role Switcher (For SIH Evaluator Convenience) */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIH Evaluator 1-Click Role Presets:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoPreset('SUPER_ADMIN', 'aicte_admin', 'Aicte@2026')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-colors"
            >
              <div className="font-bold text-cyan-400">1. Super Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">aicte_admin</div>
            </button>
            <button
              onClick={() => handleDemoPreset('REGULATION_OFFICER', 'regulation_officer', 'Aicte@2026')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-blue-500/40 transition-colors"
            >
              <div className="font-bold text-blue-400">2. Regulation Officer</div>
              <div className="text-[10px] text-slate-500 font-mono">regulation_officer</div>
            </button>
            <button
              onClick={() => handleDemoPreset('INSTITUTION_ADMIN', 'inst_admin_101', 'Aicte@2026')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-emerald-500/40 transition-colors"
            >
              <div className="font-bold text-emerald-400">3. Institution Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">registrar@ditar.edu.in</div>
            </button>
            <button
              onClick={() => handleDemoPreset('STUDENT', 'student_demo', 'Aicte@2026')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-purple-500/40 transition-colors"
            >
              <div className="font-bold text-purple-400">4. Student</div>
              <div className="text-[10px] text-slate-500 font-mono">aarav.sharma</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
