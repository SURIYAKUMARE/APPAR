import React, { useState, useEffect } from 'react';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  User,
  ShieldAlert,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Gavel,
  RefreshCw,
  Building2,
  Check,
  ArrowRight,
  CheckCircle,
  FileWarning
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CaseRecord {
  id: number;
  case_number: string;
  institution_id: string;
  case_type: string;
  title: string;
  severity: string;
  status: string;
  sla_deadline: string | null;
  assigned_officer: string;
  ai_summary: string;
  evidence: Array<{ item: string; value: string }>;
  created_at: string;
}

interface RegulatoryCasesPageProps {
  onNavigate: (page: string) => void;
}

export const RegulatoryCasesPage: React.FC<RegulatoryCasesPageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0 && !selectedCase) {
          setSelectedCase(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUpdateStatus = async (caseId: number, newStatus: string) => {
    setIsUpdating(true);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionNotice(data.message);
        await fetchCases();
        if (selectedCase) {
          setSelectedCase({ ...selectedCase, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCases = cases.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Workflow Management & Regulatory Approvals
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {cases.length} Active SLA Queues
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end statutory inquiry case management, SLA deadline tracking, multi-stage approval pipelines, and official executive orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('workflow-builder')}
            className="m3-btn-secondary text-xs py-2"
          >
            <span>Visual Workflow Engine</span>
          </button>

          <button
            onClick={fetchCases}
            className="m3-btn-secondary text-xs py-2"
            title="Refresh Queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold text-emerald-600">×</button>
        </div>
      )}

      {/* Main Docket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (5 cols): Case Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Regulatory Docket ({filteredCases.length})
            </span>
            <div className="flex items-center gap-1">
              {['ALL', 'UNDER_INVESTIGATION', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-[#2457E8] text-white'
                      : 'bg-slate-100 dark:bg-[#101B36] text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-[#2457E8] shadow-xs'
                      : 'bg-white dark:bg-[#101B36] border-slate-200 dark:border-[#1E2D52] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="font-bold text-[#2457E8] dark:text-[#16C8D8]">
                      {c.case_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      c.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}>
                      {c.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 leading-tight">
                    {c.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-medium">{c.institution_id}</span>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span>SLA: 48h Remaining</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Active Case Dossier, Timeline & Decision Controls */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="m3-card p-6 space-y-5">
              
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-mono font-bold text-[#2457E8] dark:text-[#16C8D8]">
                      {selectedCase.case_number}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">
                      {selectedCase.case_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedCase.title}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  selectedCase.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {selectedCase.status}
                </span>
              </div>

              {/* SLA & Officer Strip */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Assigned Regulatory Officer</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{selectedCase.assigned_officer}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">SLA Resolution Countdown</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                    {selectedCase.sla_deadline ? new Date(selectedCase.sla_deadline).toLocaleDateString() : '72 Hours Statutory SLA'}
                  </span>
                </div>
              </div>

              {/* AI Synthesized Forensic Summary */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-[#0A1124] border border-blue-100 dark:border-[#1E2D52] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#2457E8] dark:text-[#16C8D8]">
                  <Scale className="w-4 h-4" />
                  <span>AI Forensic Inquiry Summary</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.ai_summary}
                </p>
              </div>

              {/* Forensic Evidence Items */}
              {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Supporting Documentary Evidence:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedCase.evidence.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{ev.item}</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Approval Timeline (Step 1 to Step 4) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Statutory Workflow Stage:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">1. AI Flagged</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">2. Cross-Checked</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-[#2457E8] dark:text-cyan-300 font-bold">
                    <Clock className="w-3.5 h-3.5 mx-auto mb-1 animate-spin" />
                    <span className="text-[10px] block">3. Bureau Hearing</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-200 dark:border-slate-800 text-slate-400">
                    <FileText className="w-3.5 h-3.5 mx-auto mb-1" />
                    <span className="text-[10px] block">4. Final Order</span>
                  </div>
                </div>
              </div>

              {/* Decision Actions Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  Select Action to Update Case State:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedCase.id, 'SHOW_CAUSE_ISSUED')}
                    className="m3-btn-secondary text-xs py-1.5"
                  >
                    Issue Show-Cause Notice
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedCase.id, 'RESOLVED')}
                    className="m3-btn-primary text-xs py-1.5 bg-[#16A36A] hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Close Case</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="m3-card p-12 text-center text-slate-400">
              <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Select a case from docket</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
