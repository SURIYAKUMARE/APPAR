import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Check,
  ChevronRight,
  Settings,
  GitBranch
} from 'lucide-react';

interface Stage {
  stage_id: string;
  name: string;
  type: 'AUTOMATED' | 'HUMAN_APPROVAL';
  role: string;
  sla_sec: number;
}

interface WorkflowData {
  id: number;
  workflow_code: string;
  title: string;
  description: string;
  trigger_event: string;
  stages: Stage[];
  is_active: boolean;
}

interface ExecutionLog {
  id: number;
  workflow_code: string;
  batch_reference: string;
  current_stage: string;
  status: string;
  sla_minutes: number;
  history_log: Array<{
    stage_id: string;
    name: string;
    role: string;
    status: string;
    timestamp: string;
    notes: string;
  }>;
  created_at: string;
}

interface WorkflowBuilderPageProps {
  onNavigate: (page: string) => void;
}

export const WorkflowBuilderPage: React.FC<WorkflowBuilderPageProps> = ({ onNavigate }) => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [selectedWf, setSelectedWf] = useState<WorkflowData | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workflows', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows);
        setExecutions(data.executions);
        if (data.workflows.length > 0 && !selectedWf) {
          setSelectedWf(data.workflows[0]);
          setSelectedStage(data.workflows[0].stages[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleExecuteWorkflow = async () => {
    if (!selectedWf) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/workflows/${selectedWf.workflow_code}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ batch_reference: `BATCH-SIM-${Date.now().toString().slice(-4)}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setRunResult(data);
        await fetchWorkflows();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              AUTONOMOUS WORKFLOW ORCHESTRATOR
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SLA GUARD ACTIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            VISUAL REGULATORY WORKFLOW ENGINE
            <Workflow className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Build and monitor automated regulatory pipelines. Coordinates autonomous multi-agent validation, conditional escalation branches, and mandatory human-in-the-loop checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExecuteWorkflow}
            disabled={isRunning || !selectedWf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Play className="w-4 h-4 text-slate-950" />}
            <span>Execute Pipeline</span>
          </button>
        </div>
      </div>

      {/* Execution Banner Notice */}
      {runResult && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Workflow Executed: {runResult.workflow_code}</span>
              <span>Status: {runResult.workflow_status} • Current Stage: {runResult.current_stage}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80">SLA: 15 MIN COMPLIANT</span>
        </div>
      )}

      {/* Workflow Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {workflows.map((wf) => (
          <button
            key={wf.workflow_code}
            onClick={() => {
              setSelectedWf(wf);
              setSelectedStage(wf.stages[0]);
              setRunResult(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
              selectedWf?.workflow_code === wf.workflow_code
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            {wf.title}
          </button>
        ))}
      </div>

      {/* Visual Pipeline Canvas */}
      {selectedWf && (
        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-6 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {selectedWf.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedWf.description}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 self-start sm:self-auto">
              TRIGGER: {selectedWf.trigger_event}
            </span>
          </div>

          {/* Sequential Stage Flow Diagram */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Configured Stages & Gateways ({selectedWf.stages.length} Steps):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {selectedWf.stages.map((st, idx) => {
                const isSelected = selectedStage?.stage_id === st.stage_id;
                const isHuman = st.type === 'HUMAN_APPROVAL';

                return (
                  <div
                    key={st.stage_id}
                    onClick={() => setSelectedStage(st)}
                    className={`relative p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                        : isHuman
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-cyan-400 font-bold">STAGE 0{idx + 1}</span>
                      <span className={`px-1.5 py-0.2 rounded ${
                        isHuman ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {isHuman ? 'HUMAN' : 'AUTO'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 mb-1.5">
                      {st.name}
                    </h4>

                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {st.role}
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{st.sla_sec}s SLA</span>
                    </div>

                    {idx < selectedWf.stages.length - 1 && (
                      <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-cyan-400/80">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Inspector Detail Panel */}
          {selectedStage && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  STAGE INSPECTOR: {selectedStage.name}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: {selectedStage.stage_id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">EXECUTION MODE</span>
                  <span className="text-white font-bold">{selectedStage.type}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ASSIGNED AGENT / ROLE</span>
                  <span className="text-cyan-300 font-bold">{selectedStage.role}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SLA TIMEOUT</span>
                  <span className="text-emerald-400 font-bold">{selectedStage.sla_sec} Seconds</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                <span className="text-cyan-400 font-mono font-bold">Conditional Branching Rules: </span>
                If Verhoeff checksum fails, branch automatically to Quarantine Queue. If duplicate collision detected across institutions, halt automated approval and assign to Regulation Bureau triage.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Execution History Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-4 shadow-[0_0_20px_rgba(0,242,254,0.08)]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            WORKFLOW EXECUTION AUDIT LOG
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {executions.length} EXECUTIONS RECORDED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">EXECUTION ID</th>
                <th className="py-2.5 px-3">PIPELINE</th>
                <th className="py-2.5 px-3">BATCH REF</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">CURRENT STAGE</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {executions.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-cyan-400 font-bold">#EXEC-{ex.id}</td>
                  <td className="py-3 px-3 text-white font-sans">{ex.workflow_code}</td>
                  <td className="py-3 px-3 text-slate-300">{ex.batch_reference}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      ex.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : ex.status === 'AWAITING_APPROVAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{ex.current_stage}</td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(ex.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
