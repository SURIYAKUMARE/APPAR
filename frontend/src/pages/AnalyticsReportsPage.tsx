import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Printer, Filter, RefreshCw, 
  FileSpreadsheet, ShieldCheck, CheckCircle2, Calendar, FileText,
  Building2, Users, Layers, Award, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';

interface AnalyticsReportsPageProps {
  onNavigate: (page: string) => void;
}

const COLORS = ['#2457E8', '#16C8D8', '#16A36A', '#F5A623', '#8b5cf6', '#E34B55'];

export const AnalyticsReportsPage: React.FC<AnalyticsReportsPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'national' | 'institutions' | 'students' | 'exports'>('national');
  const [dateRange, setDateRange] = useState('AY_2026_27');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/dashboard', {
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
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const triggerExport = (name: string, url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(name);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reports, Analytics & Statutory Export Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
              Official Depository
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory AICTE compliance reporting, demographic intelligence, and audit-grade data export center.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="m3-input py-1.5 text-xs bg-white dark:bg-[#101B36]"
          >
            <option value="AY_2026_27">Academic Year 2026-27</option>
            <option value="LAST_90_DAYS">Last 90 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="ALL_TIME">All-Time Cumulative</option>
          </select>

          <button
            onClick={handlePrint}
            className="m3-btn-secondary text-xs py-1.5"
            title="Print Official Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <a
            href="/api/analytics/export/csv"
            download
            className="m3-btn-primary text-xs py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#1E2D52] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('national')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'national'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          National Statistics
        </button>
        <button
          onClick={() => setActiveTab('institutions')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'institutions'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Institution Reports
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Student Demographics
        </button>
        <button
          onClick={() => setActiveTab('exports')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'exports'
              ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Export Center
        </button>
      </div>

      {/* Tab 1: National Statistics */}
      {activeTab === 'national' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Social & Merit Quota Distribution */}
            <div className="m3-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Social & Merit Admission Quotas
                </h3>
                <p className="text-xs text-slate-400">National distribution across categories</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.category_distribution || []}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {(data?.category_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                {(data?.category_distribution || []).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300">{cat.category}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* State-Wise Enrolment Distribution */}
            <div className="m3-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  State-Wise Student Density
                </h3>
                <p className="text-xs text-slate-400">Top 10 technical education hubs</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.state_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
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
        </div>
      )}

      {/* Tab 2: Institution Reports */}
      {activeTab === 'institutions' && (
        <div className="m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institution Compliance League Table
              </h3>
              <p className="text-xs text-slate-400">
                Official regulatory index across AICTE-approved colleges
              </p>
            </div>
            <button
              onClick={() => onNavigate('institution-management')}
              className="text-xs font-semibold text-[#2457E8] hover:underline flex items-center gap-1"
            >
              <span>Manage Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0A1124] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-[#1E2D52]">
                <tr>
                  <th className="py-3 px-3">Institution</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3 text-right">Sanctioned Intake</th>
                  <th className="py-3 px-3 text-right">Compliance Score</th>
                  <th className="py-3 px-3 text-center">AICTE Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.compliance_rankings || []).map((inst: any) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{inst.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{inst.id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{inst.state}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {inst.total_approved_intake || 390} Seats
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#2457E8] dark:text-[#16C8D8]">
                      {inst.compliance_score}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300">
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Student Demographics */}
      {activeTab === 'students' && (
        <div className="m3-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Course-Wise Admission Disaggregation
              </h3>
              <p className="text-xs text-slate-400">Enrolment distribution across technical streams</p>
            </div>
            <button
              onClick={() => onNavigate('students-directory')}
              className="text-xs font-semibold text-[#2457E8] hover:underline flex items-center gap-1"
            >
              <span>Explore Student Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.course_distribution || []).map((c: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">{c.course}</p>
                  <p className="text-[10px] text-slate-400">B.Tech / B.E. 4-Year Undergraduate</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#2457E8] dark:text-[#16C8D8] font-mono">{c.count}</span>
                  <span className="text-[10px] text-slate-400 block">Students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Official Export Center */}
      {activeTab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Export 1: All Students Master CSV */}
          <div className="m3-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2457E8]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  National Student Master Depository (CSV)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full dataset of 994 student enrolments including 12-digit APAAR IDs, Verhoeff checksum results, and college affiliation.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Format: RFC-4180 CSV</span>
              <button
                onClick={() => triggerExport('Student_Master_Depository', '/api/analytics/export/csv')}
                className="m3-btn-primary text-xs py-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          {/* Export 2: Institutional Compliance Index */}
          <div className="m3-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A36A]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Institution Intake & Compliance Ledger
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  AICTE approval status, sanctioned vs enrolled seat metrics, and compliance ratings across all 10 institutions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Format: CSV / XLSX</span>
              <button
                onClick={() => triggerExport('Institution_Compliance_Matrix', '/api/analytics/export/csv')}
                className="m3-btn-secondary text-xs py-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset</span>
              </button>
            </div>
          </div>

          {/* Export 3: Duplicate & Anomaly Investigation Log */}
          <div className="m3-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#E34B55]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Regulatory Anomaly & Duplicate Audit Trail
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete incident log of cross-college collisions, intake breaches, and human officer resolutions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Format: Audit JSON / CSV</span>
              <button
                onClick={() => triggerExport('Regulatory_Anomalies_Audit', '/api/analytics/export/csv')}
                className="m3-btn-secondary text-xs py-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Export 4: Statutory Print Summary */}
          <div className="m3-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official AICTE Gazette Summary (Printable)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formatted summary for statutory submission to Ministry of Education and state regulatory authorities.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Format: PDF / Print</span>
              <button
                onClick={handlePrint}
                className="m3-btn-secondary text-xs py-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Gazette</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 p-3 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xl z-50">
          <Check className="w-4 h-4" />
          <span>{downloadSuccess} downloaded successfully.</span>
        </div>
      )}

    </div>
  );
};
