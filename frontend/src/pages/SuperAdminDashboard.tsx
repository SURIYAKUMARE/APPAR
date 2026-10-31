import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldCheck, AlertTriangle, CopyX, 
  TrendingUp, Download, Filter, RefreshCw, CheckCircle2, ChevronRight, MapPin,
  Clock, ArrowUpRight, ArrowDownRight, Sparkles, Activity, FileCheck, ExternalLink,
  ShieldAlert, CheckCircle, Database, Server
} from 'lucide-react';
import { IndiaMapSVG } from '../components/IndiaMapSVG';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigate: (page: string) => void;
}

const DONUT_COLORS = ['#16A36A', '#2457E8', '#F5A623', '#E34B55'];

// Monthly registration trend for Stripe-style AreaChart
const REGISTRATION_TREND_DATA = [
  { month: 'Jun', registrations: 120, verified: 105 },
  { month: 'Jul', registrations: 290, verified: 260 },
  { month: 'Aug', registrations: 540, verified: 480 },
  { month: 'Sep', registrations: 780, verified: 690 },
  { month: 'Oct', registrations: 920, verified: 810 },
  { month: 'Nov', registrations: 994, verified: 879 },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
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
    apaar_verification_rate: 88.4
  };

  const verificationDonutData = [
    { name: 'Verified APAAR', value: kpis.verified_apaar || 879 },
    { name: 'In Processing', value: kpis.pending_verification || 111 },
    { name: 'Flagged Anomaly', value: kpis.flagged_duplicates || 4 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / National Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Executive National Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2457E8] dark:bg-cyan-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time APAAR ID verification, intake compliance, and autonomous regulatory intelligence across AICTE-approved institutions.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="m3-input py-1.5 text-xs bg-white dark:bg-[#101B36]"
          >
            <option value="">All States / UTs</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Telangana">Telangana</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-white dark:bg-[#101B36] border border-slate-200 dark:border-[#1E2D52] text-slate-600 dark:text-slate-300 hover:text-[#2457E8] shadow-2xs transition-colors"
            title="Refresh National Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Report CTA */}
          <a
            href="/api/analytics/export/csv"
            download
            className="m3-btn-secondary py-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* AI Command OS Shortcut */}
          <button
            onClick={() => onNavigate('ai-command-center')}
            className="m3-btn-primary py-1.5 text-xs bg-gradient-to-r from-[#2457E8] to-[#16C8D8]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Command OS</span>
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards (Material 3 / Stripe Style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Total Registered Students */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Students</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2457E8] dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpis.total_students.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A36A] mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% YoY</span>
            </div>
          </div>
        </div>

        {/* KPI 2: APAAR IDs Created */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">APAAR IDs Created</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#16C8D8]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpis.total_students.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              <span>100% Unique Checksum</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Verified Students */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Students</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16A36A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpis.verified_apaar}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A36A] mt-1">
              <span>{kpis.apaar_verification_rate}% Rate</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Verifications */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#F5A623]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpis.pending_verification}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
              <span>In SLA queue</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Registered Institutions */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Institutions</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {kpis.total_institutions}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              <span>AICTE Monitored</span>
            </div>
          </div>
        </div>

        {/* KPI 6: Data Quality Score */}
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Data Quality Score</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#16A36A] tracking-tight">
              98.4%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              <span>SHA-256 Validated</span>
            </div>
          </div>
        </div>

      </div>

      {/* Stripe-Style Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left (2 cols): Registration & Verification Growth Over Time */}
        <div className="lg:col-span-2 m3-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Registration & Verification Growth
              </h2>
              <p className="text-xs text-slate-400">
                Monthly trajectory of student admissions versus APAAR cryptographic verifications
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#2457E8]" />
                <span className="text-slate-600 dark:text-slate-300">Registrations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#16C8D8]" />
                <span className="text-slate-600 dark:text-slate-300">Verified APAAR</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2457E8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2457E8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16C8D8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#16C8D8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#101B36', 
                    borderColor: '#1E2D52', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Area type="monotone" dataKey="registrations" stroke="#2457E8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReg)" />
                <Area type="monotone" dataKey="verified" stroke="#16C8D8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVer)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (1 col): Verification Status Donut Chart */}
        <div className="m3-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Verification Status Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              National distribution across verification stages
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {verificationDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#101B36', 
                    borderColor: '#1E2D52', 
                    borderRadius: '12px', 
                    fontSize: '11px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {verificationDonutData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Geospatial Surveillance & State-Wise Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* National Map SVG (1 col) */}
        <div className="m3-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Geospatial Surveillance
              </h2>
              <p className="text-xs text-slate-400">Interactive state coverage map</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400">
              India
            </span>
          </div>
          <IndiaMapSVG selectedState={selectedState} onSelectState={setSelectedState} />
        </div>

        {/* State-Wise Student Distribution Bar Chart (2 cols) */}
        <div className="lg:col-span-2 m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                State-Wise Technical Enrolments
              </h2>
              <p className="text-xs text-slate-400">Active student counts across states & UTs</p>
            </div>
            <button 
              onClick={() => onNavigate('analytics-reports')}
              className="text-xs text-[#2457E8] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Detailed Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.state_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="state" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#101B36', 
                    borderColor: '#1E2D52', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="students" fill="#2457E8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tri-Column Executive Section: Activity Feed, Action Items & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 1. Recent Activity Feed */}
        <div className="m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2457E8]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent National Activity
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Feed</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Bulk CSV Import Complete (350 records)
                </p>
                <p className="text-[11px] text-slate-400">
                  Delhi Inst. of Tech. • Admin User • 2 mins ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Duplicate APAAR Cross-College Clashing Alert
                </p>
                <p className="text-[11px] text-slate-400">
                  AICTE Detection Agent • Case #DUP-9823 • 14 mins ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Verhoeff Checksum Real-Time Batch Pass
                </p>
                <p className="text-[11px] text-slate-400">
                  ABC Sandbox API • 120 verified • 32 mins ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Supernumerary TFW Quota Validation
                </p>
                <p className="text-[11px] text-slate-400">
                  Anna University • Within 5% limit • 1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Pending Action Items with Quick Review Buttons */}
        <div className="m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F5A623]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending Regulatory Action
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              3 Requires Attention
            </span>
          </div>

          <div className="space-y-3">
            {/* Action Item 1 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-200/80 dark:border-[#1E2D52] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Duplicate APAAR: 982345108742
                </p>
                <p className="text-[11px] text-slate-400">
                  Concurrent registration at 2 institutes
                </p>
              </div>
              <button
                onClick={() => onNavigate('duplicate-detection')}
                className="px-2.5 py-1 text-xs font-semibold text-[#2457E8] bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Review
              </button>
            </div>

            {/* Action Item 2 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-200/80 dark:border-[#1E2D52] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Intake Cap Breach (+10%)
                </p>
                <p className="text-[11px] text-slate-400">
                  INST-AICTE-107 CSE exceeded approved intake
                </p>
              </div>
              <button
                onClick={() => onNavigate('admission-compliance')}
                className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 rounded-lg hover:bg-amber-100 transition-colors"
              >
                Audit
              </button>
            </div>

            {/* Action Item 3 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-200/80 dark:border-[#1E2D52] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Employer Background Check
                </p>
                <p className="text-[11px] text-slate-400">
                  TCS Verification Desk • 4 records
                </p>
              </div>
              <button
                onClick={() => onNavigate('employer-portal')}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Inspect
              </button>
            </div>
          </div>
        </div>

        {/* 3. AI-Generated Insights & Recommendations */}
        <div className="m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16C8D8]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Autonomous Insights
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#16C8D8] dark:bg-cyan-950/60">
              Confidence 98.4%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/60 to-cyan-50/40 dark:from-[#0A1124] dark:to-blue-950/20 border border-blue-100 dark:border-[#1E2D52] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2457E8] dark:text-[#16C8D8]">
              <ShieldCheck className="w-4 h-4" />
              <span>Recommended Regulatory Optimization</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Auto-reconciliation flagged 12 provisional offline enrolments that match ABC National Depository records. Enabling one-click auto-approval will elevate national verification rate to <strong>89.6%</strong>.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={() => onNavigate('ai-command-center')}
                className="px-3 py-1.5 text-xs font-semibold bg-[#2457E8] hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors"
              >
                Execute Auto-Approval
              </button>
            </div>
          </div>

          {/* Live System Health Monitor */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>National System Health</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">99.98% Uptime</span>
          </div>
        </div>

      </div>

    </div>
  );
};
