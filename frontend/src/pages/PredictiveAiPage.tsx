import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PredictiveAiPageProps {
  onNavigate: (page: string) => void;
}

const HISTORICAL_AND_FORECAST_DATA = [
  { year: '2023', cse: 82000, ece: 48000, mechanical: 36000, aids: 21000, type: 'Historical' },
  { year: '2024', cse: 91000, ece: 49000, mechanical: 33000, aids: 34000, type: 'Historical' },
  { year: '2025', cse: 104000, ece: 51000, mechanical: 31000, aids: 49000, type: 'Historical' },
  { year: '2026', cse: 118000, ece: 53000, mechanical: 29000, aids: 68000, type: 'Current' },
  { year: '2027 (P)', cse: 134000, ece: 56000, mechanical: 27000, aids: 92000, type: 'Forecast' },
  { year: '2028 (P)', cse: 152000, ece: 58000, mechanical: 25000, aids: 121000, type: 'Forecast' },
  { year: '2029 (P)', cse: 169000, ece: 60000, mechanical: 23000, aids: 155000, type: 'Forecast' },
  { year: '2030 (P)', cse: 185000, ece: 61000, mechanical: 21000, aids: 194000, type: 'Forecast' },
];

const INSTITUTION_RISK_SCORES = [
  {
    id: 'INST-AICTE-107',
    name: 'Delhi Institute of Technology & Advanced Research',
    state: 'Delhi',
    riskScore: 84,
    status: 'HIGH_RISK',
    primaryFactor: 'Chronic Excess Intake (+10% in CSE)',
    duplicateRate: '4.2%',
    vacancyRisk: 'Low (Overcapacity)',
  },
  {
    id: 'INST-AICTE-104',
    name: 'St. Xavier Engineering Academy',
    state: 'Goa',
    riskScore: 68,
    status: 'MODERATE_RISK',
    primaryFactor: 'Seat Vacancy in Mechanical & Civil (42% unfilled)',
    duplicateRate: '0.8%',
    vacancyRisk: 'High',
  },
  {
    id: 'INST-AICTE-101',
    name: 'Vellore Advanced Institute of Technology',
    state: 'Tamil Nadu',
    riskScore: 18,
    status: 'LOW_RISK',
    primaryFactor: 'Balanced intake with 99.4% APAAR seed compliance',
    duplicateRate: '0.1%',
    vacancyRisk: 'Minimal',
  },
  {
    id: 'INST-AICTE-102',
    name: 'Maharashtra Polytechnic & Tech Campus',
    state: 'Maharashtra',
    riskScore: 24,
    status: 'LOW_RISK',
    primaryFactor: 'High compliance, minor transliteration variance',
    duplicateRate: '0.3%',
    vacancyRisk: 'Minimal',
  },
];

export const PredictiveAiPage: React.FC<PredictiveAiPageProps> = ({ onNavigate }) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              SCIKIT-LEARN PREDICTIVE CORE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40">
              HORIZON 2026 - 2030
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            PREDICTIVE ADMISSION INTELLIGENCE
            <TrendingUp className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Machine learning forecast models analyzing national student demographic shifts, branch demand velocity, and college non-compliance risk vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">MODEL ACCURACY</span>
            <span className="text-emerald-400 font-bold text-base">96.8% R² FIT</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              NATIONAL BRANCH ENROLMENT PROJECTION (2023 - 2030)
            </h3>
            <p className="text-xs text-slate-400">
              Notice explosive 320% growth projected in Artificial Intelligence & Data Science seats.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Legend:</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-[#00f2fe]" /> CSE
            </span>
            <span className="flex items-center gap-1 text-violet-400">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> AI & DS
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> ECE
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Mech
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_AND_FORECAST_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradAids" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradEce" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#030712',
                  borderColor: '#06b6d4',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 0 15px rgba(0,242,254,0.2)',
                }}
              />
              <Area type="monotone" dataKey="cse" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#gradCse)" name="Computer Science" />
              <Area type="monotone" dataKey="aids" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#gradAids)" name="AI & Data Science" />
              <Area type="monotone" dataKey="ece" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradEce)" name="Electronics (ECE)" />
              <Area type="monotone" dataKey="mechanical" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={0.1} fill="#f59e0b" name="Mechanical" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Institutional Risk Forecaster & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Institution Risk Table */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              AICTE REGULATORY RISK MATRIX (ANOMALY HEURISTICS)
            </h3>
            <span className="text-xs font-mono text-slate-400">10 INSTITUTIONS MONITORED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">INSTITUTION</th>
                  <th className="py-2.5 px-3">RISK SCORE</th>
                  <th className="py-2.5 px-3">PRIMARY ANOMALY FACTOR</th>
                  <th className="py-2.5 px-3">DUPE RATIO</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INSTITUTION_RISK_SCORES.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-sans">{item.name}</div>
                      <span className="text-[10px] text-slate-500">{item.id} • {item.state}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'HIGH_RISK'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : item.status === 'MODERATE_RISK'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {item.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {item.primaryFactor}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">
                      {item.duplicateRate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('digital-twin')}
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
                        title="Open in Digital Twin Simulator"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Explainable AI Feature Importance */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-cyan-500/20 pb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            SHAP EXPLAINABILITY WEIGHTS
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Feature contributions informing the AI anomaly risk scoring algorithm:
          </p>

          <div className="space-y-3 pt-1">
            {[
              { feature: 'Excess Intake Over Sanctioned Cap', weight: 42, color: 'bg-red-400' },
              { feature: 'Cross-College Duplicate Frequency', weight: 28, color: 'bg-amber-400' },
              { feature: 'Faculty-Student Ratio Deficit (<1:20)', weight: 16, color: 'bg-cyan-400' },
              { feature: 'APAAR ID Checksum Lag Time', weight: 14, color: 'bg-violet-400' },
            ].map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{f.feature}</span>
                  <span className="font-bold text-white">{f.weight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full`}
                    style={{ width: `${f.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-cyan-400 font-bold block">GOVERNANCE GUARANTEE:</span>
            <span>All AI anomaly risk scores are purely advisory and require formal human inspection by an AICTE Regulation Officer before regulatory notices are issued.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
