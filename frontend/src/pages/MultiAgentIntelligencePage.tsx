import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ChevronRight,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Check,
  Share2,
  Filter
} from 'lucide-react';

interface AgentData {
  agent_id: string;
  name: string;
  category: string;
  role_description: string;
  status: string;
  confidence_score: number;
  collaborates_with?: string[];
  current_task: string;
  metrics: Record<string, any>;
  pending_actions: Array<{
    action_id: string;
    title: string;
    severity: string;
    description: string;
    requires_approval: boolean;
  }>;
  last_active: string;
}

interface MultiAgentIntelligencePageProps {
  onNavigate: (page: string) => void;
}

export const MultiAgentIntelligencePage: React.FC<MultiAgentIntelligencePageProps> = ({ onNavigate }) => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningAgent, setScanningAgent] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/agents', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error('Failed to load agents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleRunScan = async (agentId: string) => {
    setScanningAgent(agentId);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/agents/${agentId}/run`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanningAgent(null);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/agents/action/${actionId}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(data.message);
        setTimeout(() => setActionSuccessMsg(null), 5000);
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['ALL', 'Digital Identity', 'Checksum & Cryptography', 'Fraud & Collision Radar', 'Regulatory Oversight', 'Forecasting & ML', 'OCR & Ingestion', 'Zero-Trust & Telemetry'];

  const filteredAgents = agents.filter((a) => {
    if (categoryFilter === 'ALL') return true;
    return a.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-violet-500/30 p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 tracking-wider">
              MULTI-AGENT INTELLIGENCE MESH 2.0
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              15/15 SPECIALIZED AGENTS ONLINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            AUTONOMOUS AGENT ECOSYSTEM
            <Cpu className="w-7 h-7 text-violet-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Fifteen coordinated AI micro-agents continuously monitoring identity integrity, OCR document extraction, cross-state duplicate collisions, intake caps, and zero-trust cybersecurity telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('workflow-builder')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            WORKFLOW BUILDER
          </button>
          <button
            onClick={fetchAgents}
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh All Agents Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <span className="text-xs font-mono text-emerald-400/80">AUTHORITY: REGULATION BUREAU</span>
        </div>
      )}

      {/* Visual Multi-Agent Collaboration Topology Graph */}
      <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-4 shadow-[0_0_20px_rgba(0,242,254,0.08)]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            NEURAL AGENT COLLABORATION TOPOLOGY (INTER-AGENT DATA CHANNELS)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
            LIVE PROTOCOL: TLS_RPC_V2
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {[
            { from: 'Identity Intel', to: 'APAAR Checksum', channel: 'Luhn/Verhoeff Stream' },
            { from: 'APAAR Checksum', to: 'Duplicate Radar', channel: 'HMAC Collision Scan' },
            { from: 'Duplicate Radar', to: 'Admission Compliance', channel: 'Cross-College Flags' },
            { from: 'Admission Compliance', to: 'Regulatory Inquiry', channel: 'Over-Intake Breaches' },
            { from: 'Document OCR', to: 'Data Quality', channel: 'Fuzzy Soundex Sync' },
            { from: 'Predictive ML', to: 'Policy Simulator', channel: '2026-2030 Projections' },
            { from: 'Cybersecurity SOC', to: 'Privacy Monitoring', channel: 'Zero-Trust Telemetry' },
            { from: 'Offline Sync', to: 'Vector Consensus', channel: 'IndexedDB Reconciler' },
            { from: 'Credential Vault', to: 'External Verifier', channel: 'Dynamic QR Proofs' },
            { from: 'Benchmarking Agent', to: 'Report Generator', channel: 'APH Scorecard Briefs' },
          ].map((link, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="truncate">{link.from}</span>
                <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{link.to}</span>
              </div>
              <div className="text-[9px] text-slate-500 truncate">{link.channel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
              categoryFilter === cat
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 15 Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => {
          const isScanning = scanningAgent === agent.agent_id;
          const hasPending = agent.pending_actions && agent.pending_actions.length > 0;

          return (
            <div
              key={agent.agent_id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                hasPending
                  ? 'bg-gradient-to-b from-slate-900 to-amber-950/30 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-900/90 border-cyan-500/20 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.06)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {agent.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {agent.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{agent.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {agent.role_description}
                </p>

                {/* Current Active Task readout */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                  <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                    HEURISTIC LOOP:
                  </span>
                  <p className="text-xs text-slate-300 font-mono leading-tight">
                    {agent.current_task}
                  </p>
                </div>

                {/* Key Metrics Chips */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Telemetry Metrics:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(agent.metrics || {}).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono"
                      >
                        <span className="text-[9px] text-slate-500 uppercase block truncate">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-cyan-300 truncate block">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Actions Requiring Human-in-the-Loop */}
                {hasPending && (
                  <div className="space-y-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>HUMAN APPROVAL REQUIRED</span>
                    </div>
                    {agent.pending_actions.map((act) => (
                      <div key={act.action_id} className="text-xs text-slate-300 space-y-1.5">
                        <div className="font-semibold text-white">{act.title}</div>
                        <p className="text-[11px] text-slate-400">{act.description}</p>
                        <button
                          onClick={() => handleApproveAction(act.action_id)}
                          className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          Authorize Regulatory Action
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-400 font-mono">
                  <span>Confidence:</span>
                  <span className="text-emerald-400 font-bold">
                    {agent.confidence_score}%
                  </span>
                </div>

                <button
                  onClick={() => handleRunScan(agent.agent_id)}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono text-xs transition-colors"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Run Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
