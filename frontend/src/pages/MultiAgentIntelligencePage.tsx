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
  Check
} from 'lucide-react';

interface AgentData {
  agent_id: string;
  name: string;
  category: string;
  role_description: string;
  status: string;
  confidence_score: number;
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
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/agents', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (!selectedAgent && data.length > 0) {
          setSelectedAgent(data[0]);
        }
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-violet-500/30 p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 tracking-wider">
              MULTI-AGENT INTELLIGENCE MESH
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              10/10 SYNCHRONIZED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            COORDINATED AI AGENT ECOSYSTEM
            <Cpu className="w-7 h-7 text-violet-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Ten autonomous micro-agents continuously auditing identity integrity, checksums, duplicate admissions, intake caps, and cybersecurity zero-trust telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('ai-command-center')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI COMMAND OS
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

      {/* Multi-Agent Sequential Pipeline Visualizer */}
      <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-5">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          AUTONOMOUS VERIFICATION PIPELINE FLOW
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: '01', name: 'Identity Intel', desc: 'ABC & DigiLocker Link' },
            { step: '02', name: 'APAAR Checksum', desc: 'Verhoeff Algorithm' },
            { step: '03', name: 'Duplicate Radar', desc: 'Cross-State Collision' },
            { step: '04', name: 'Compliance Gate', desc: 'Sanctioned Intake Cap' },
            { step: '05', name: 'Regulatory Dossier', desc: 'APH Audit Record' },
          ].map((pipe, idx) => (
            <div
              key={idx}
              className="relative p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center"
            >
              <span className="text-[10px] font-mono font-bold text-violet-400 block mb-0.5">
                STAGE {pipe.step}
              </span>
              <div className="text-xs font-bold text-white mb-0.5">{pipe.name}</div>
              <div className="text-[10px] text-slate-400">{pipe.desc}</div>
              {idx < 4 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 10 Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
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
              {/* Agent Card Header */}
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
                    CURRENT HEURISTIC CYCLE:
                  </span>
                  <p className="text-xs text-slate-300 font-mono leading-tight">
                    {agent.current_task}
                  </p>
                </div>

                {/* Key Metrics Chips */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Real-time Telemetry:
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
