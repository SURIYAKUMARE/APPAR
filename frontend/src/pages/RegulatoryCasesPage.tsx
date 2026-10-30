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
  Check
} from 'lucide-react';

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
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('access_token');
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
      const token = localStorage.getItem('access_token');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              REGULATORY CASE WORKSPACE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
              3 ACTIVE INQUIRIES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            REGULATORY INVESTIGATION DESK
            <Scale className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            End-to-end inquiry case management for intake violations, cross-institution duplicate admissions, and quota fraud. AI-synthesized forensic evidence dossiers with statutory APH citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('regulation-bureau')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)]"
          >
            <Gavel className="w-4 h-4 text-cyan-400" />
            <span>Show-Cause Desk</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Cases List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Regulatory Inquiry Docket ({cases.length} Open):
          </span>

          <div className="space-y-2.5">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCase?.id === c.id
                    ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.2)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-cyan-400 font-bold">{c.case_number}</span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    c.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {c.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-2 mb-2">
                  {c.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{c.institution_id}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Case Forensic Dossier & Action Controls */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-5 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {selectedCase.case_number}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedCase.case_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedCase.title}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border self-start sm:self-auto ${
                  selectedCase.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : selectedCase.status === 'SHOW_CAUSE_ISSUED'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedCase.status}
                </span>
              </div>

              {/* AI-Generated Forensic Briefing */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  AI FORENSIC CASE SUMMARY:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedCase.ai_summary}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  <span>Assigned Officer: {selectedCase.assigned_officer}</span>
                  <span>SLA Deadline: 7 Days</span>
                </div>
              </div>

              {/* Evidence File Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Documented Forensic Evidence:
                </span>
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-2 font-mono text-xs">
                  {selectedCase.evidence.map((ev, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">{ev.item}:</span>
                      <span className="text-white font-bold">{ev.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Regulatory Action Triggers */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Statutory Regulatory Directives:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.id, 'SHOW_CAUSE_ISSUED')}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Issue Show-Cause</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.id, 'HEARING_SCHEDULED')}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Hearing</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.id, 'RESOLVED')}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              Select an inquiry case on the left to review forensic dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
