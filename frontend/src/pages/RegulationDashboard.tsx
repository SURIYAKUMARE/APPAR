import React, { useState, useEffect } from 'react';
import { 
  Scale, AlertTriangle, ShieldCheck, CheckCircle2, 
  UserCheck, FileText, Send, RefreshCw, X, ChevronRight, Eye 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnomalyEvent } from '../types';

interface RegulationDashboardProps {
  onNavigate: (page: string) => void;
}

export const RegulationDashboard: React.FC<RegulationDashboardProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [actionStatus, setActionStatus] = useState<'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'>('INVESTIGATING');
  const [submitting, setSubmitting] = useState(false);
  const [noticeGenerated, setNoticeGenerated] = useState<string | null>(null);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anomalies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnomalies(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnomaly) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/anomalies/${selectedAnomaly.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionStatus,
          officer_name: user?.full_name || 'Regulation Bureau Chief',
          notes: officerNotes || 'Triage completed in accordance with AICTE Approval Process Handbook.'
        })
      });

      if (res.ok) {
        setSelectedAnomaly(null);
        setOfficerNotes('');
        await fetchAnomalies();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateNotice = (anom: AnomalyEvent) => {
    setNoticeGenerated(
      `AICTE / REG-BUR / 2026 / NOTICE-${anom.institution_id}\n\n` +
      `TO: Registrar / Head of Institution [${anom.institution_id}]\n` +
      `SUBJECT: Show Cause Notice - Breach of Approved Technical Intake / Supernumerary Quota Regulations (SIH 2026)\n\n` +
      `Sir/Madam,\n` +
      `Upon automated analysis of your 2026-2027 student enrolment records through the Central APAAR Depository, an anomaly (Risk Score: ${anom.risk_score}/100, Severity: ${anom.severity}) has been flagged:\n\n` +
      `DETAILS: ${anom.reason}\n\n` +
      `In accordance with Clause 7.2 of the AICTE Approval Process Handbook, you are hereby requested to provide audited verification documents within seven (7) working days, failing which regulatory sanctions will be instituted.\n\n` +
      `By Order of the Regulation Bureau,\nAICTE New Delhi`
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AICTE Regulation Bureau Compliance Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforcing approved intake ceilings, supernumerary caps (TFW/PMSSS/FN), and AI-driven anomaly risk scoring with mandatory Human-in-the-Loop review.
          </p>
        </div>

        <button
          onClick={fetchAnomalies}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 hover:border-cyan-500 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Human-in-the-loop Mandate Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-900 dark:text-cyan-200 text-xs flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Human-in-the-Loop Regulatory Guarantee:</strong> Automated Isolation Forest algorithms compute multi-dimensional risk scores (0–100), but statutory action or student rejection is never triggered automatically without human officer triage and review.
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Flagged Anomaly Incidents ({anomalies.length})
            </h2>
            <p className="text-xs text-slate-500">Multivariate anomalies ranked by isolation forest risk score</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3 text-center">Risk Score</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-4">Reason & Violation</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {anomalies.map((anom) => (
                <tr key={anom.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">
                    {anom.event_type}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                      {anom.institution_id}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {anom.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      anom.severity === 'CRITICAL' || anom.severity === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {anom.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300 truncate">
                    {anom.reason}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      anom.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : anom.status === 'INVESTIGATING'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {anom.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedAnomaly(anom)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-colors"
                    >
                      Triage Review
                    </button>
                    <button
                      onClick={() => handleGenerateNotice(anom)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
                    >
                      Draft Notice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Regulatory Triage Review: Incident #{selectedAnomaly.id}
                </h3>
              </div>
              <button onClick={() => setSelectedAnomaly(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <div className="text-slate-400 font-semibold">Violation Summary:</div>
                <div className="text-slate-900 dark:text-slate-100 font-medium">{selectedAnomaly.reason}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <div className="text-slate-400 font-semibold">AI Recommended Action:</div>
                <div className="text-slate-900 dark:text-slate-100">{selectedAnomaly.recommended_action}</div>
              </div>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Update Triage Status
                </label>
                <select
                  value={actionStatus}
                  onChange={(e: any) => setActionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="INVESTIGATING">INVESTIGATING - Formal Enquiry Initiated</option>
                  <option value="RESOLVED">RESOLVED - Sanctions Applied / Supernumerary Verified</option>
                  <option value="DISMISSED">DISMISSED - Deemed False Positive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Official Officer Findings & Hand-book Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Enter regulatory rationale for tamper-evident audit ledger..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAnomaly(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 shadow-sm"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Commit Official Finding</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Notice Modal */}
      {noticeGenerated && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  AICTE Statutory Show Cause Notice (Preview)
                </h3>
              </div>
              <button onClick={() => setNoticeGenerated(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-700">
              {noticeGenerated}
            </pre>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setNoticeGenerated(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
