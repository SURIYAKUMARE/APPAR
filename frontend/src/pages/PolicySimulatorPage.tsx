import React, { useState, useEffect } from 'react';
import {
  Sliders,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  Download,
  Printer,
  Sparkles,
  Info,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';

interface Scenario {
  id: number;
  scenario_code: string;
  scenario_name: string;
  created_by: string;
  scenario_params: {
    target_branch: string;
    national_intake_delta_pct: number;
    supernumerary_female_stem_pct: number;
    tfw_cap_pct: number;
  };
  projected_impact: {
    additional_national_seats: number;
    projected_total_intake: number;
    estimated_budget_inr_cr: number;
    additional_faculty_required: number;
    regional_impact: Array<{ state: string; additional_seats: number; budget_cr: number }>;
  };
  risk_analysis: {
    faculty_shortage_risk: string;
    infrastructure_strain_pct: number;
    curriculum_obsolescence_risk: string;
    recommendation: string;
  };
}

interface PolicySimulatorPageProps {
  onNavigate: (page: string) => void;
}

export const PolicySimulatorPage: React.FC<PolicySimulatorPageProps> = ({ onNavigate }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [intakeDelta, setIntakeDelta] = useState<number>(15);
  const [femaleStemDelta, setFemaleStemDelta] = useState<number>(5);
  const [tfwCap, setTfwCap] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/policy-scenarios', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setScenarios(data);
          if (data.length > 0) {
            setSelectedScenario(data[0]);
            setIntakeDelta(data[0].scenario_params.national_intake_delta_pct);
            setFemaleStemDelta(data[0].scenario_params.supernumerary_female_stem_pct);
            setTfwCap(data[0].scenario_params.tfw_cap_pct);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  // Compute live simulated projection numbers
  const baseNationalSeats = 360000;
  const simAdditionalSeats = Math.round(baseNationalSeats * (intakeDelta / 100.0) + baseNationalSeats * (femaleStemDelta / 100.0));
  const simTotalSeats = baseNationalSeats + simAdditionalSeats;
  const simBudgetCr = Math.round((simAdditionalSeats * 31500) / 10000000.0 * 10) / 10;
  const simFacultyDeficit = Math.round(simAdditionalSeats / 20.0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              MACRO POLICY SANDBOX
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              HYPOTHETICAL SIMULATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            NATIONAL POLICY SIMULATOR
            <Sliders className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Simulate macroeconomic educational policy directives across 10,000+ technical institutions nationwide. Model seat surges, faculty deficits, and state budget implications before publishing in the AICTE Approval Process Handbook (APH).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Scenario
          </button>
        </div>
      </div>

      {/* Scenario Presets Pill Bar */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => (
          <button
            key={sc.scenario_code}
            onClick={() => {
              setSelectedScenario(sc);
              setIntakeDelta(sc.scenario_params.national_intake_delta_pct);
              setFemaleStemDelta(sc.scenario_params.supernumerary_female_stem_pct);
              setTfwCap(sc.scenario_params.tfw_cap_pct);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
              selectedScenario?.scenario_code === sc.scenario_code
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            {sc.scenario_name}
          </button>
        ))}
      </div>

      {/* Main Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Policy Sliders */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-5 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              POLICY DIRECTIVE PARAMETERS
            </h3>

            {/* Slider 1: National Intake Expansion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  National Sanctioned Intake Surge:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  +{intakeDelta}% Nationwide
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={intakeDelta}
                onChange={(e) => setIntakeDelta(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Status Quo)</span>
                <span>+15% (Recommended)</span>
                <span>+30% (High Strain)</span>
              </div>
            </div>

            {/* Slider 2: Female STEM Supernumerary */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  Female STEM Supernumerary Quota:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  +{femaleStemDelta}% Reserved
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={femaleStemDelta}
                onChange={(e) => setFemaleStemDelta(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Standard)</span>
                <span>+5% (Target)</span>
                <span>+15% (Max)</span>
              </div>
            </div>

            {/* Slider 3: Tuition Fee Waiver Cap */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  TFW Quota Ceiling:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {tfwCap}% Ceiling
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="12"
                step="1"
                value={tfwCap}
                onChange={(e) => setTfwCap(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Current Statutory)</span>
                <span>8% (Modeled)</span>
                <span>12% (Extreme)</span>
              </div>
            </div>
          </div>

          {/* Statutory Advisory Note */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Info className="w-4 h-4" />
              Hypothetical Simulation Advisory:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All projections generated in this module are hypothetical simulations designed for regulatory planning. Official seat sanction notifications remain governed by the AICTE Approval Process Handbook (APH 2026-27).
            </p>
          </div>
        </div>

        {/* Right Column: Projected Impact Outcomes */}
        <div className="lg:col-span-7 space-y-5">
          {/* National Projections HUD */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,242,254,0.1)] space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-0.5">
                  PROJECTED NATIONAL OUTCOME
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedScenario?.scenario_name || 'Simulated Policy Scenario'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                FEASIBLE
              </span>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">ADDITIONAL SEATS</span>
                <span className="text-xl font-bold text-cyan-300 font-mono">
                  +{simAdditionalSeats.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">PROJECTED INTAKE</span>
                <span className="text-xl font-bold text-white font-mono">
                  {simTotalSeats.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED GRANT</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{simBudgetCr} Cr
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">FACULTY DEFICIT</span>
                <span className="text-xl font-bold text-red-400 font-mono">
                  +{simFacultyDeficit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Regional Impact Breakdown Table */}
          {selectedScenario?.projected_impact.regional_impact && (
            <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                REGIONAL & STATE-WISE SEAT ALLOCATION MODEL
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3">STATE JURISDICTION</th>
                      <th className="py-2 px-3">PROJECTED NEW SEATS</th>
                      <th className="py-2 px-3">EST. ANNUAL BUDGET</th>
                      <th className="py-2 px-3">FACULTY NEEDED (1:20)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedScenario.projected_impact.regional_impact.map((reg, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-white">{reg.state}</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">
                          +{reg.additional_seats.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400">₹{reg.budget_cr} Cr</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {Math.round(reg.additional_seats / 20)} positions
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AICTE Policy Planning Cell Recommendation */}
          {selectedScenario?.risk_analysis && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-cyan-400 font-mono block">
                POLICY RECOMMENDATION (AI PLANNING CELL):
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedScenario.risk_analysis.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
