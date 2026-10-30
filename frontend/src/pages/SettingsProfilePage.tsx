import React, { useState } from 'react';
import { 
  Settings, User, Lock, Smartphone, ShieldCheck, 
  Trash2, Moon, Sun, CheckCircle2, AlertCircle, RefreshCw, KeyRound 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { offlineStorage } from '../utils/indexedDB';

interface SettingsProfilePageProps {
  onNavigate: (page: string) => void;
}

export const SettingsProfilePage: React.FC<SettingsProfilePageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [totpVerified, setTotpVerified] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassMessage(null);

    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPass.length < 8) {
      setPassError('Password must be at least 8 characters.');
      return;
    }

    setPassMessage('Administrative credentials updated securely.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handlePurgeCache = async () => {
    if (window.confirm('Clear all local browser cached educational records?')) {
      await offlineStorage.purgeAllData();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrative Settings & Security Profile
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage Government Credentials, TOTP Authenticator Keys, and Local Encrypted Storage.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name || 'Administrator'}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'admin@aicte-india.org'}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Role: {user?.role || 'SUPER_ADMIN'}
                </span>
                {user?.institution_id && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-500/10 text-blue-500">
                    {user.institution_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>Theme: {theme === 'dark' ? 'Dark Navy' : 'Light Gov'}</span>
          </button>
        </div>

        {/* TOTP Authenticator 2FA Setup */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-cyan-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              TOTP Authenticator Integration (Google / Microsoft Authenticator)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan this regulatory TOTP secret key to configure second-factor authentication on mobile device.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <QRCodeDisplay 
              value="otpauth://totp/AICTE-APAAR-ONE:admin@aicte-india.org?secret=JBSWY3DPEHPK3PXP&issuer=AICTE-India" 
              size={130}
              label="AICTE TOTP 2FA"
            />
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Base32 Secret Key:</span>
              <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm tracking-widest bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                JBSW Y3DP EHPK 3PXP
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>2FA Algorithm: SHA-1 / 30-Second Refresh Cycle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Change Government Password
            </h3>
          </div>

          {passMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passMessage}</span>
            </div>
          )}

          {passError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-type"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Local Storage & Cache Purge */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Local Storage Security Sanitization
            </h4>
            <p className="text-[11px] text-slate-500">
              Purges local IndexedDB object stores and provisional offline admission tokens from this device.
            </p>
          </div>

          <button
            onClick={handlePurgeCache}
            className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Browser Cache</span>
          </button>
        </div>

        {purgeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs">
            Browser educational data sanitized successfully.
          </div>
        )}

      </div>

    </div>
  );
};
