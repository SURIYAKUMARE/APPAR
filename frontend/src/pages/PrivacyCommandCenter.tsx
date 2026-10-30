import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Eye, EyeOff, UserCheck, 
  FileText, CheckCircle2, AlertTriangle, RefreshCw, Clock, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PrivacyCommandCenterProps {
  onNavigate: (page: string) => void;
}

export const PrivacyCommandCenter: React.FC<PrivacyCommandCenterProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const [maskingEnabled, setMaskingEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(1825); // 5-year statutory educational retention
  const [consentPolicy, setConsentPolicy] = useState('EXPLICIT_OPT_IN');

  const accessLogs = [
    { timestamp: '2026-10-30 22:45', actor: 'bgv.desk@tcs-enterprise.com', action: 'VERIFICATION_READ', fields: 'Full Name, Course, Verification Status', consent: 'APPROVED' },
    { timestamp: '2026-10-30 21:10', actor: 'registrar@ditar.edu.in', action: 'BATCH_INGEST', fields: '12-Digit APAAR, DOB, Gender', consent: 'STATUTORY_AICTE' },
    { timestamp: '2026-10-30 18:02', actor: 'cag.auditor@gov.in', action: 'AUDIT_INSPECT', fields: 'Immutable Hash Chain, Compliance Scores', consent: 'REGULATORY_CLEARANCE' },
    { timestamp: '2026-10-30 14:30', actor: 'student_demo (Self)', action: 'CONSENT_REVOKE', fields: 'Consent Token #CS-991', consent: 'STUDENT_DIRECT' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Command Center (DPDP Act 2023 Compliant)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data Minimization • Purpose Limitation • Consent Revocation • Sovereign Cryptographic Masking.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Statutory DPDP Certified</span>
        </span>
      </div>

      {/* 3 Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Minimization</span>
            <EyeOff className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Masked Identifiers</h3>
          <p className="text-[11px] text-slate-500 leading-tight">
            Raw 12-digit APAAR IDs masked as <code>XXXX-XXXX-1234</code> in all public verifier queries and audit views.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consent Architecture</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Student Sovereign Control</h3>
          <p className="text-[11px] text-slate-500 leading-tight">
            Third-party background verifiers require student-granted explicit consent with automatic 90-day expiry.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statutory Retention</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Retention Schedule</h3>
          <p className="text-[11px] text-slate-500 leading-tight">
            Academic records archived under AICTE Approval Process Handbook policy; local caches sanitized upon session expiry.
          </p>
        </div>
      </div>

      {/* Access History & Audit Log */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Personal Data Access Audit Trail (DPDP Sec 12)
          </h2>
          <p className="text-xs text-slate-500">Every external inspection, verifier check, and administrative read recorded</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Data Fiduciary / Actor</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Fields Accessed</th>
                <th className="py-2.5 px-2 text-center">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {accessLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{log.actor}</td>
                  <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{log.action}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-sans">{log.fields}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {log.consent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrator Privacy Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Institutional Privacy Safeguards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Strict Field-Level Masking</div>
              <div className="text-[11px] text-slate-500">Masks APAAR in external downloads and logs</div>
            </div>
            <input
              type="checkbox"
              checked={maskingEnabled}
              onChange={(e) => setMaskingEnabled(e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Third-Party Consent Expiry</div>
              <div className="text-[11px] text-slate-500">Auto-expires employer verification tokens</div>
            </div>
            <span className="font-mono font-bold text-cyan-500">90 Days</span>
          </div>
        </div>
      </div>

    </div>
  );
};
