import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Users,
  GraduationCap,
  TrendingUp,
  Cpu,
  RefreshCw,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface SimulationResult {
  institution_id: string;
  institution_name: string;
  state: string;
  simulation_parameters: {
    enrolment_delta_percent: number;
    supernumerary_additional: number;
    simulated_enrolment: number;
    baseline_enrolment: number;
  };
  digital_twin_metrics: {
    baseline_capacity: number;
    simulated_capacity: number;
    simulated_total_students: number;
    seat_utilization_pct: number;
    supernumerary_utilization_pct: number;
    max_supernumerary_allowed: number;
    simulated_supernumerary: number;
    existing_faculty: number;
    required_faculty: number;
    faculty_deficit: number;
    faculty_student_ratio: string;
  };
  regulatory_impact: {
    is_breach: boolean;
    compliance_score: number;
    risk_level: 'LOW' | 'WARNING' | 'CRITICAL';
    recommendations: string[];
  };
}

interface AcademicDigitalTwinPageProps {
  onNavigate: (page: string) => void;
}

export const AcademicDigitalTwinPage: React.FC<AcademicDigitalTwinPageProps> = ({ onNavigate }) => {
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string; state: string }>>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('INST-AICTE-101');
  const [enrolmentDelta, setEnrolmentDelta] = useState<number>(15);
  const [cseQuota, setCseQuota] = useState<number>(120);
  const [additionalSupernumerary, setAdditionalSupernumerary] = useState<number>(5);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch institution list
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/institutions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
          if (data.length > 0) {
            setSelectedInstId(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInstitutions();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/simulation/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          institution_id: selectedInstId,
          enrolment_delta_percent: enrolmentDelta,
          branch_quota_overrides: { CSE: cseQuota },
          supernumerary_additional_seats: additionalSupernumerary,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstId) {
      runSimulation();
    }
  }, [selectedInstId, enrolmentDelta, cseQuota, additionalSupernumerary]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              AICTE ACADEMIC DIGITAL TWIN
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SIMULATION ENGINE v2.0
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            INSTITUTION DIGITAL TWIN
            <Building2 className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Simulate what-if enrolment scenarios, intake variations, and supernumerary expansions to test institutional resilience against statutory AICTE guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEnrolmentDelta(0);
              setCseQuota(120);
              setAdditionalSupernumerary(0);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Control Sliders */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-5 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              SIMULATION PARAMETERS & SLIDERS
            </h3>

            {/* Institution Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Select Target Institution:
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.state}) - {inst.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Slider 1: Enrolment Surge */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  Enrolment Surge Delta (%):
                </span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  enrolmentDelta > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : enrolmentDelta < 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {enrolmentDelta > 0 ? `+${enrolmentDelta}%` : `${enrolmentDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={enrolmentDelta}
                onChange={(e) => setEnrolmentDelta(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-20% (Contraction)</span>
                <span>0% (Baseline)</span>
                <span>+50% (Surge)</span>
              </div>
            </div>

            {/* Slider 2: CSE Sanctioned Seats */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  Computer Science Sanctioned Intake:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  {cseQuota} Seats
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="240"
                step="30"
                value={cseQuota}
                onChange={(e) => setCseQuota(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>60 Seats</span>
                <span>120 (Standard)</span>
                <span>240 Seats</span>
              </div>
            </div>

            {/* Slider 3: Supernumerary Quota Additions */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  Additional Supernumerary Seats (TFW/NRI):
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  +{additionalSupernumerary} Seats
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={additionalSupernumerary}
                onChange={(e) => setAdditionalSupernumerary(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (None)</span>
                <span>+15 (Ceiling Warning)</span>
                <span>+30 (Breach)</span>
              </div>
            </div>
          </div>

          {/* Statutory Guidelines Helper Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-400">
              <Info className="w-4 h-4" />
              AICTE Regulatory Norms Reference:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>Mandated Faculty-Student Ratio: 1:20 for undergraduate engineering programs.</li>
              <li>Supernumerary ceiling: Max 15% of sanctioned intake (TFW, EWS, J&K, NRI, FN).</li>
              <li>Classroom utilization above 100% triggers mandatory show-cause notice.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Digital Twin Real-Time Outcomes HUD */}
        <div className="lg:col-span-7 space-y-5">
          {result && (
            <>
              {/* Overall Digital Twin Health Meter */}
              <div className={`rounded-2xl p-6 border transition-all ${
                result.regulatory_impact.risk_level === 'CRITICAL'
                  ? 'bg-gradient-to-r from-red-950/40 to-slate-900 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                  : result.regulatory_impact.risk_level === 'WARNING'
                  ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : 'bg-gradient-to-r from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      SIMULATED REGULATORY OUTCOME
                    </span>
                    <h2 className="text-xl font-bold text-white">
                      {result.institution_name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">COMPLIANCE INDEX</span>
                      <span className={`text-2xl font-extrabold font-mono ${
                        result.regulatory_impact.compliance_score > 80
                          ? 'text-emerald-400'
                          : result.regulatory_impact.compliance_score > 60
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}>
                        {result.regulatory_impact.compliance_score}/100
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      result.regulatory_impact.risk_level === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                        : result.regulatory_impact.risk_level === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    }`}>
                      {result.regulatory_impact.risk_level} RISK
                    </span>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">SANCTIONED SEATS</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {result.digital_twin_metrics.simulated_capacity}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">TOTAL ENROLMENT</span>
                    <span className="text-lg font-bold text-cyan-300 font-mono">
                      {result.digital_twin_metrics.simulated_total_students}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">SEAT UTILIZATION</span>
                    <span className={`text-lg font-bold font-mono ${
                      result.digital_twin_metrics.seat_utilization_pct > 100 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {result.digital_twin_metrics.seat_utilization_pct}%
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">FACULTY RATIO</span>
                    <span className="text-lg font-bold text-violet-300 font-mono">
                      {result.digital_twin_metrics.faculty_student_ratio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Faculty & Infrastructure Stress Audit */}
              <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ACADEMIC RESOURCE STRESS TEST
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Faculty Mandate (1:20)</span>
                      <span className="text-white font-bold">
                        {result.digital_twin_metrics.existing_faculty} / {result.digital_twin_metrics.required_faculty} Needed
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          result.digital_twin_metrics.faculty_deficit > 0
                            ? 'bg-red-500'
                            : 'bg-emerald-400'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (result.digital_twin_metrics.existing_faculty /
                              Math.max(1, result.digital_twin_metrics.required_faculty)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    {result.digital_twin_metrics.faculty_deficit > 0 ? (
                      <span className="text-[11px] text-red-400 font-mono block">
                        Deficit: -{result.digital_twin_metrics.faculty_deficit} faculty positions required.
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono block">
                        Compliant: Adequate teaching faculty deployed.
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Supernumerary Ceiling (15%)</span>
                      <span className="text-white font-bold">
                        {result.digital_twin_metrics.simulated_supernumerary} / {result.digital_twin_metrics.max_supernumerary_allowed} Max
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          result.digital_twin_metrics.supernumerary_utilization_pct > 100
                            ? 'bg-red-500'
                            : 'bg-cyan-400'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            result.digital_twin_metrics.supernumerary_utilization_pct
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Utilization: {result.digital_twin_metrics.supernumerary_utilization_pct}% of allowed 15% quota.
                    </span>
                  </div>
                </div>

                {/* AICTE Policy Recommendations */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-mono text-cyan-400 block mb-2 font-bold">
                    RECOMMENDED REGULATORY ACTIONS:
                  </span>
                  <div className="space-y-1.5">
                    {result.regulatory_impact.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
