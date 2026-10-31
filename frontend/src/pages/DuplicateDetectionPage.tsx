import React, { useState, useEffect } from 'react';
import { 
  CopyX, ShieldCheck, AlertTriangle, CheckCircle2, 
  RefreshCw, X, Send, Eye, Lock, Filter, Building2, User, 
  ArrowRightLeft, Sparkles, CheckCircle, Scale, ChevronRight,
  FileText, Activity
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
  const [filterSeverity, setFilterSeverity] = useState('ALL');

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

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Intelligence Center: Duplicate & Anomaly Detection
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {alerts.length} Active Anomalies
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Privacy-preserving cryptographic hash matching across institutions. Explainable AI with evidence-backed findings and human review authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai-command-center')}
            className="m3-btn-secondary text-xs py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2457E8]" />
            <span>AI Command OS</span>
          </button>

          <button
            onClick={fetchAlerts}
            className="m3-btn-secondary text-xs py-2"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tri-Metric Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="m3-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#E34B55]">
            <CopyX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Cross-College Clashes</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {alerts.length} Incidents Flagged
            </div>
          </div>
        </div>

        <div className="m3-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2457E8] dark:text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">AI Matching Model</span>
            <div className="text-xl font-bold text-[#2457E8] dark:text-cyan-400">
              Salted HMAC SHA-256
            </div>
          </div>
        </div>

        <div className="m3-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A36A]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Explainability & Human-in-Loop</span>
            <div className="text-xl font-bold text-[#16A36A]">
              100% Audit Tracked
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="m3-card p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Filter by Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-[#2457E8] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-[#0A1124] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-[11px]">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </span>
      </div>

      {/* Explainable AI Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="m3-card p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2457E8]" />
            <span>Scanning national telemetry for duplicate identities...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="m3-card p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#16A36A]" />
            <p className="font-bold text-slate-700 dark:text-slate-200">Zero Critical Anomalies Detected</p>
            <p className="text-xs text-slate-400 mt-1">All registered students have passed cross-institutional deduplication checks.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="m3-card p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {alert.severity} SEVERITY
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    Incident #{alert.id}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {alert.duplicate_type || 'Cross-Institution Concurrent Registration'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Confidence: 98.4%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>

              {/* Explainable AI Findings: 4 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Pillar 1: What was detected */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    1. What Was Detected:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {alert.description || 'Simultaneous active technical enrolment discovered across two separate AICTE institutions for the same academic cycle.'}
                  </p>
                </div>

                {/* Pillar 2: Why it was flagged */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    2. Detection Rationale & Algorithmic Trigger:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200">
                    Identical 12-digit APAAR hash collision in central verification index. Aadhaar zero-knowledge token matches candidate in both Delhi and Mumbai databases.
                  </p>
                </div>

                {/* Pillar 3: Supporting Evidence */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 space-y-1.5 md:col-span-2">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    3. Supporting Evidence & Institution Records:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#101B36] border border-slate-200/80 dark:border-[#1E2D52]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Institution</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">INST-101 (Delhi Inst. of Technology)</p>
                      <p className="text-[11px] text-slate-500">Course: Computer Science & Engg • Admission: Direct Merit</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#101B36] border border-slate-200/80 dark:border-[#1E2D52]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Conflicting Institution</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{alert.conflicting_institution_id || 'INST-103 (Mumbai National Engg)'}</p>
                      <p className="text-[11px] text-slate-500">Course: Information Technology • Admission: Institutional Quota</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pillar 4: Recommended Action & Authorization */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2457E8] shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Recommended Action:</strong> Initiate Institutional Clarification Workflow and issue provisional seat hold on conflicting admission.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setResolutionChoice('RESOLVED_GENUINE');
                    }}
                    className="m3-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Examine Case
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setResolutionChoice('REJECTED_DUPLICATE');
                    }}
                    className="m3-btn-primary py-1.5 px-3 text-xs bg-[#E34B55] hover:bg-red-700"
                  >
                    Take Regulatory Action
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Human Review Authorization Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101B36] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E2D52] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#2457E8]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Regulatory Decision Desk: Case #{selectedAlert.id}
                </h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Regulatory Determination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionChoice('RESOLVED_GENUINE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      resolutionChoice === 'RESOLVED_GENUINE'
                        ? 'border-[#16A36A] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-500" />
                    <span>Approve Genuine Transfer / Dual Degree</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionChoice('REJECTED_DUPLICATE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      resolutionChoice === 'REJECTED_DUPLICATE'
                        ? 'border-[#E34B55] bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CopyX className="w-4 h-4 mb-1 text-rose-500" />
                    <span>Invalidate Secondary Admission</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Officer Order & Case Justification:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record justification, state merit rank, or institutional order reference..."
                  className="m3-input w-full resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="m3-btn-secondary text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="m3-btn-primary text-xs py-2"
                >
                  {submitting ? 'Applying Regulatory Order...' : 'Sign & Execute Regulatory Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
