import React, { useState, useEffect } from 'react';
import { 
  CopyX, ShieldCheck, AlertTriangle, CheckCircle2, 
  RefreshCw, X, Send, Eye, Lock, Filter, Building2, User, ArrowRightLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DuplicateAlert } from '../types';

interface DuplicateDetectionPageProps {
  onNavigate: (page: string) => void;
}

export const DuplicateDetectionPage: React.FC<DuplicateDetectionPageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState<DuplicateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<DuplicateAlert | null>(null);
  const [resolutionChoice, setResolutionChoice] = useState<'RESOLVED_GENUINE' | 'REJECTED_DUPLICATE'>('RESOLVED_GENUINE');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/duplicates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/duplicates/${selectedAlert.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution: resolutionChoice,
          notes: notes || 'Reviewed by AICTE Regulation Bureau officer against state admissions merit list.',
          officer_name: user?.full_name || 'AICTE Officer'
        })
      });

      if (res.ok) {
        setSelectedAlert(null);
        setNotes('');
        await fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <CopyX className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cross-Institution Duplicate Intelligence Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Privacy-Preserving Salted HMAC Matching • Side-by-Side Dual Enrolment Investigation.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 text-xs flex items-start space-x-3 shadow-lg">
        <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-cyan-400">Cryptographic Salted HMAC-SHA256 Fingerprinting:</strong> Cross-system matching evaluates collision indices through keyed hashes. Plaintext citizen biometric or identity identifiers are never shared across institutional boundaries without verified human authorization.
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Duplicate Collision Alerts ({alerts.length})
          </h2>
          <p className="text-xs text-slate-500">Dual technical admissions, student roll collisions, and repeat enrolments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Collision Type</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-3 text-center">Risk Score</th>
                <th className="py-3 px-4">Incident Description</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Side-By-Side Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {alt.duplicate_type}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {alt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                    {alt.risk_score} / 100
                  </td>
                  <td className="py-3 px-4 max-w-sm text-slate-600 dark:text-slate-300">
                    {alt.description}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      alt.status === 'UNDER_REVIEW'
                        ? 'bg-amber-500/10 text-amber-600'
                        : alt.status === 'RESOLVED_GENUINE'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {alt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedAlert(alt)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-sm transition-colors flex items-center space-x-1 ml-auto"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Compare Records</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Side-by-Side Dual Admission Comparison: Incident #{selectedAlert.id}
                  </h3>
                  <p className="text-xs text-slate-500">Cross-Institution Collision Analysis & Evidence Verification</p>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Student Comparison Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Record A (Primary) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-extrabold text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    Institution A (Primary)
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {selectedAlert.student?.institution_id || 'INST-AICTE-101'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Student Name:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedAlert.student?.full_name || 'Aarav Sharma'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Roll / Reg ID:</span>
                    <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {selectedAlert.student?.student_id || '101-CSE-2026-0010'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Discipline / Course:</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedAlert.student?.course || 'Computer Science and Engineering'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Masked APAAR ID:</span>
                    <div className="font-mono font-bold text-cyan-500">
                      XXXX-XXXX-8742
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Enrolment Timestamp:</span>
                    <div className="font-mono text-slate-500 text-[11px]">
                      2026-07-15T10:30:00Z (Central Stamped)
                    </div>
                  </div>
                </div>
              </div>

              {/* Record B (Conflicting Institution) */}
              <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                  <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Institution B (Conflicting)
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {selectedAlert.conflicting_institution_id || 'INST-AICTE-102'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Student Name:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedAlert.student?.full_name || 'Aarav Sharma'} (Exact Match)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Roll / Reg ID:</span>
                    <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      102-CSE-2026-0010 (Concurrent Collision)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Discipline / Course:</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      Computer Science and Engineering
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Masked APAAR ID:</span>
                    <div className="font-mono font-bold text-rose-500">
                      XXXX-XXXX-8742 (100% Collision)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Enrolment Timestamp:</span>
                    <div className="font-mono text-slate-500 text-[11px]">
                      2026-07-22T14:15:00Z (Secondary Submission)
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Collision Analysis Bar */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>AICTE Regulatory Norm Evaluation:</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300">
                AICTE Approval Process Handbook strictly prohibits simultaneous regular full-time technical admissions across multiple institutions. A student cannot claim two concurrent AICTE seats.
              </p>
            </div>

            {/* Officer Resolution Form */}
            <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Statutory Determination Action
                </label>
                <select
                  value={resolutionChoice}
                  onChange={(e: any) => setResolutionChoice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="REJECTED_DUPLICATE">
                    REJECTED_DUPLICATE — Invalidate Secondary Admission (Cancel Seat at Institution B)
                  </option>
                  <option value="RESOLVED_GENUINE">
                    RESOLVED_GENUINE — Approved Institutional Migration / Authorized Transfer
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Officer Audit Findings & Evidence Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record verification verification documents, transfer certificate IDs, or AICTE handbook clause applied..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Commit Official Resolution</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
