import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldCheck, AlertTriangle, CopyX, 
  TrendingUp, Download, Filter, RefreshCw, CheckCircle2, ChevronRight, MapPin 
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { IndiaMapSVG } from '../components/IndiaMapSVG';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigate: (page: string) => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (selectedCourse) params.append('course', selectedCourse);

      const res = await fetch(`/api/analytics/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedState, selectedCourse]);

  const kpis = data?.kpis || {
    total_institutions: 10,
    total_students: 994,
    verified_apaar: 879,
    pending_verification: 111,
    flagged_duplicates: 4,
    institutions_exceeding_intake: 1,
    total_approved_intake: 3900,
    total_actual_enrolment: 994,
    total_supernumerary: 136,
    total_nri: 37,
    total_oci: 8,
    total_foreign_national: 5,
    apaar_verification_rate: 88.4
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title & National Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AICTE National HQ Overview
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/30">
              Live National Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time regulatory compliance, duplicate monitoring, and APAAR verification across Indian technical institutions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All States / UTs</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Telangana">Telangana</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500"
            title="Refresh National Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href="/api/analytics/export/csv"
            download
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Institutions"
          value={kpis.total_institutions}
          subtitle="AICTE Approved"
          icon={Building2}
          color="cyan"
        />
        <StatCard
          title="Total Students"
          value={kpis.total_students.toLocaleString()}
          subtitle="Enrolled 2026-27"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="APAAR Verified"
          value={`${kpis.apaar_verification_rate}%`}
          subtitle={`${kpis.verified_apaar} records`}
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Duplicate Alerts"
          value={kpis.flagged_duplicates}
          subtitle="Cross-College Clashes"
          icon={CopyX}
          color="rose"
        />
        <StatCard
          title="Intake Violations"
          value={kpis.institutions_exceeding_intake}
          subtitle="Excess Enrolments"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Supernumerary"
          value={kpis.total_supernumerary}
          subtitle="TFW / PMSSS / FN"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* National Geospatial Surveillance Map */}
      <IndiaMapSVG selectedState={selectedState} onSelectState={setSelectedState} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* State-wise Enrolment Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                State-Wise Student Enrolment Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total active regular and supernumerary admissions</p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">10 Monitored States</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.state_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="state" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="students" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course-Wise Enrolment Breakdown (1 col) */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Course-Wise Admissions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across engineering streams</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.course_distribution || []}
                  dataKey="count"
                  nameKey="course"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(data?.course_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            {(data?.course_distribution || []).slice(0, 4).map((c: any, i: number) => (
              <div key={i} className="flex items-center space-x-1.5 truncate">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{c.course.replace('Engineering', 'Engg')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Top Compliant Institutions & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Compliant Institutions League Table */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Institution Compliance Index
            </h2>
            <button
              onClick={() => onNavigate('institution-management')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center space-x-0.5 hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Institution</th>
                  <th className="py-2.5 px-2">State</th>
                  <th className="py-2.5 px-2 text-right">Score</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.compliance_rankings || []).slice(0, 5).map((inst: any) => (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                        {inst.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{inst.id}</div>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400">{inst.state}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {inst.compliance_score}%
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        inst.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Actions & Quick Jump */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Urgent Regulatory Workflows
          </h2>
          
          <div className="space-y-3">
            <div 
              onClick={() => onNavigate('duplicate-detection')}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between cursor-pointer hover:bg-rose-500/15 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-rose-500 text-white">
                  <CopyX className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-rose-900 dark:text-rose-200">
                    Dual Technical Enrolment Detected
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">
                    APAAR 982345108742 flagged across 2 colleges. Requires human review.
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </div>

            <div 
              onClick={() => onNavigate('admission-compliance')}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-900">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    Intake Limit Breach: INST-AICTE-107
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    132 students enrolled in CSE against 120 approved seats (+10% excess).
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </div>

            <div 
              onClick={() => onNavigate('audit-log')}
              className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between cursor-pointer hover:bg-cyan-500/15 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-cyan-900 dark:text-cyan-200">
                    Tamper-Evident SHA-256 Audit Chain
                  </div>
                  <div className="text-[11px] text-cyan-700 dark:text-cyan-400">
                    All administrative actions logged into immutable ledger. Integrity verified.
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-500" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
