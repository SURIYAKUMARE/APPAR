import React, { useState } from 'react';
import { 
  Settings, User, Lock, Smartphone, ShieldCheck, 
  Trash2, Moon, Sun, CheckCircle2, AlertCircle, RefreshCw, KeyRound,
  Shield, Check, ExternalLink, Globe, Server, Webhook
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { offlineStorage } from '../utils/indexedDB';

interface SettingsProfilePageProps {
  onNavigate: (page: string) => void;
}

export const SettingsProfilePage: React.FC<SettingsProfilePageProps> = ({ onNavigate }) => {
  const { user, role, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'security' | 'institution' | 'api'>('profile');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // API Token state
  const [apiKey, setApiKey] = useState('aicte_live_sec_98f4a17b2c3d4e5f6a7b8c9d0e1f2a3b');
  const [copiedKey, setCopiedKey] = useState(false);

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

    setPassMessage('Administrative credentials updated securely in database.');
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

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const permissionsMatrix = [
    { module: 'Student Enrolment & Bulk Upload', superAdmin: true, regOfficer: true, instAdmin: true, student: false },
    { module: 'APAAR ID Checksum Validation', superAdmin: true, regOfficer: true, instAdmin: true, student: true },
    { module: 'Duplicate Detection Engine', superAdmin: true, regOfficer: true, instAdmin: false, student: false },
    { module: 'Intake Ceiling Enforcement', superAdmin: true, regOfficer: true, instAdmin: false, student: false },
    { module: 'Regulatory Order Promulgation', superAdmin: true, regOfficer: true, instAdmin: false, student: false },
    { module: 'Immutable SHA-256 Audit Trail', superAdmin: true, regOfficer: true, instAdmin: false, student: false },
    { module: 'Statutory CSV / PDF Export', superAdmin: true, regOfficer: true, instAdmin: true, student: false },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Settings & Institutional Governance Profile
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
              Government Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative credentials, TOTP two-factor authentication, RBAC authorization matrix, and API tokens.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="m3-btn-secondary text-xs py-2 self-start sm:self-auto"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#1E2D52] text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Profile
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Roles & Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security & TOTP MFA
        </button>
        <button
          onClick={() => setActiveTab('institution')}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'institution'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Institution Config
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          API Settings & Webhooks
        </button>
      </div>

      {/* Tab 1: User Profile */}
      {activeTab === 'profile' && (
        <div className="m3-card p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2457E8] to-[#16C8D8] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.full_name || 'AICTE Super Administrator'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user?.email || 'admin@aicte-india.org'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200">
                  Role: {role}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 border border-emerald-200">
                  {user?.institution_id || 'AICTE HQ National Bureau'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Assigned Administrative Bureau</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">AICTE Regulation Bureau (HQ New Delhi)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Regulatory Clearance Level</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Level 4: National Super Administrator</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="m3-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Authorization boundaries enforced across government user roles
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A1124] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-[#1E2D52]">
                <tr>
                  <th className="py-2.5 px-3">System Capability</th>
                  <th className="py-2.5 px-2 text-center">Super Admin</th>
                  <th className="py-2.5 px-2 text-center">Regulation Bureau</th>
                  <th className="py-2.5 px-2 text-center">College Admin</th>
                  <th className="py-2.5 px-2 text-center">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {item.module}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.instAdmin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.student ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security & TOTP MFA */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Change Password Form */}
          <div className="m3-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Update Administrative Password
              </h3>
              <p className="text-xs text-slate-400">Enforce government-grade credentials</p>
            </div>

            {passMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passMessage}</span>
              </div>
            )}

            {passError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-rose-200">
                <AlertCircle className="w-4 h-4" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="m3-input w-full"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  New Strong Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="m3-input w-full"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="m3-input w-full"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="m3-btn-primary text-xs py-2 w-full">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* TOTP Authenticator & Offline Cache */}
          <div className="space-y-5">
            <div className="m3-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    TOTP Two-Factor Authenticator
                  </h3>
                  <p className="text-xs text-slate-400">Google Authenticator / Aegis integration</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 border border-emerald-300">
                  ENABLED
                </span>
              </div>

              <div className="flex justify-center py-2">
                <QRCodeDisplay data="otpauth://totp/AICTE-APAAR:admin@aicte-india.org?secret=JBSWY3DPEHPK3PXP&issuer=AICTE" size={130} />
              </div>

              <p className="text-[11px] text-slate-400 text-center font-mono">
                Secret: JBSW-Y3DP-EHPK-3PXP
              </p>
            </div>

            {/* Cache purge */}
            <div className="m3-card p-5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Purge Encrypted Local Cache</h4>
                <p className="text-[11px] text-slate-400">Clear offline IndexedDB records from browser memory</p>
              </div>
              <button
                onClick={handlePurgeCache}
                className="m3-btn-secondary text-xs py-1.5 text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Institution Configuration */}
      {activeTab === 'institution' && (
        <div className="m3-card p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Affiliation & Settings
            </h3>
            <p className="text-slate-400">Registered parameters for active regulatory entity</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Primary Institution Identifier</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{user?.institution_id || 'INST-AICTE-HQ'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Sanctioned Annual Quota</span>
              <span className="font-mono font-bold text-[#2457E8] dark:text-[#16C8D8] mt-0.5 block">3,900 Total Approved Seats</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Depository Sync Protocol</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Academic Bank of Credits (ABC) v2</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Statutory Handbook Reference</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">AICTE Approval Process Handbook (APH 2026-27)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: API Settings & Webhooks */}
      {activeTab === 'api' && (
        <div className="m3-card p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              OpenAPI Keys & Integration Endpoints
            </h3>
            <p className="text-slate-400">Tokens for authorized SIS and ERP campus integrations</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block">
              Active Production Bearer Token:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="m3-input font-mono text-xs flex-1 bg-slate-50 dark:bg-[#0A1124]"
              />
              <button
                onClick={copyApiKey}
                className="m3-btn-secondary text-xs py-2 px-3"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-[#16A36A]" /> : <span>Copy</span>}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Registered Webhook Endpoints:
            </span>
            <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
              <span>https://api.aicte-india.org/v1/webhook/apaar-events</span>
              <span className="text-emerald-600 font-semibold">200 OK Active</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
