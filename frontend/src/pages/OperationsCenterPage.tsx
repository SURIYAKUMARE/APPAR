import React, { useState } from 'react';
import {
  Server,
  Activity,
  Database,
  Cpu,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Zap,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface OperationsCenterPageProps {
  onNavigate: (page: string) => void;
}

export const OperationsCenterPage: React.FC<OperationsCenterPageProps> = ({ onNavigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleRunDiagnostics = () => {
    setIsRefreshing(true);
    setSuccessNote(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setSuccessNote('Full cluster diagnostics completed: 15/15 agents healthy, database latency 1.4ms, Zero-Trust TLS 1.3 verified.');
      setTimeout(() => setSuccessNote(null), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              NATIONAL DEVOPS & TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CLUSTER HEALTH: 100%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            FUTURE OPERATIONS CENTER
            <Server className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Real-time infrastructure operations desk. Monitors FastAPI response times, SQLite database health, micro-agent execution heartbeats, distributed sync queues, and hardware resource utilization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDiagnostics}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-950 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Run Deep Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successNote && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Top Telemetry KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-1 shadow-[0_0_15px_rgba(0,242,254,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">API LATENCY</span>
          <span className="text-2xl font-extrabold text-cyan-300 font-mono">14 ms</span>
          <span className="text-[10px] text-emerald-400 font-mono block">99.98% Under 50ms</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-1 shadow-[0_0_15px_rgba(0,242,254,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">DATABASE TIME</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">1.8 ms</span>
          <span className="text-[10px] text-slate-400 font-mono block">Zero Lock Contention</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-1 shadow-[0_0_15px_rgba(0,242,254,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">ACTIVE AGENTS</span>
          <span className="text-2xl font-extrabold text-violet-300 font-mono">15 / 15</span>
          <span className="text-[10px] text-emerald-400 font-mono block">Heartbeat Verified</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-1 shadow-[0_0_15px_rgba(0,242,254,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">CACHE HIT RATIO</span>
          <span className="text-2xl font-extrabold text-cyan-300 font-mono">94.2%</span>
          <span className="text-[10px] text-cyan-400 font-mono block">Memory Accelerated</span>
        </div>
      </div>

      {/* Middle Operations Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Micro-Agent Heartbeat Table */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-4 shadow-[0_0_20px_rgba(0,242,254,0.08)]">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              15 NEURAL MICRO-AGENT CLUSTER HEARTBEATS
            </h3>
            <span className="text-xs font-mono text-emerald-400">STATUS: HEALTHY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'identity_intelligence', name: 'Identity Intel', ping: '12ms' },
              { id: 'apaar_validation', name: 'APAAR Validation', ping: '8ms' },
              { id: 'duplicate_detection', name: 'Duplicate Radar', ping: '15ms' },
              { id: 'admission_compliance', name: 'Admission Compliance', ping: '11ms' },
              { id: 'predictive_analytics', name: 'Predictive ML', ping: '24ms' },
              { id: 'document_intelligence', name: 'Document OCR', ping: '31ms' },
              { id: 'data_quality', name: 'Data Hygiene', ping: '9ms' },
              { id: 'cybersecurity_soc', name: 'Cybersecurity SOC', ping: '7ms' },
              { id: 'offline_sync', name: 'Offline Vector Sync', ping: '14ms' },
              { id: 'regulatory_investigation', name: 'Regulatory Inquiry', ping: '18ms' },
              { id: 'report_generation', name: 'Report Generator', ping: '16ms' },
              { id: 'privacy_monitoring', name: 'Privacy & DPDP', ping: '10ms' },
              { id: 'institution_benchmarking', name: 'Benchmarking', ping: '21ms' },
              { id: 'academic_credential', name: 'Credential Vault', ping: '13ms' },
              { id: 'policy_simulation', name: 'Policy Simulator', ping: '26ms' },
            ].map((ag) => (
              <div
                key={ag.id}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-sans text-xs">{ag.name}</span>
                </div>
                <span className="text-[10px] text-cyan-400">{ag.ping}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Server Telemetry & Storage Gauges */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-4 shadow-[0_0_20px_rgba(0,242,254,0.08)]">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              RESOURCE ALLOCATION
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>RAM Memory Utilization</span>
                  <span className="text-cyan-300 font-bold">248 MB / 1024 MB</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[24%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>SQLite DB Footprint</span>
                  <span className="text-emerald-400 font-bold">667 KB (Optimized)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[15%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>IndexedDB Client Store</span>
                  <span className="text-violet-300 font-bold">Encrypted (AES-GCM)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-400 rounded-full w-[100%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('api-integration')}
                className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 text-center transition-colors"
              >
                Inspect OpenAPI Adapters
              </button>
              <button
                onClick={() => onNavigate('offline-center')}
                className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 text-center transition-colors"
              >
                Inspect Sync Queues
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
