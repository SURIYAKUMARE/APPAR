import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Printer, Filter, RefreshCw, 
  FileSpreadsheet, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts';

interface AnalyticsReportsPageProps {
  onNavigate: (page: string) => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const AnalyticsReportsPage: React.FC<AnalyticsReportsPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('ALL_ENROLMENTS');

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              National Intelligence, Reports & Statutory Depository
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated Analytics across Technical Institutions • Exportable Audited Formats.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>

          <a
            href="/api/analytics/export/csv"
            download
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official CSV</span>
          </a>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Social & Merit Quota Distribution
          </h2>
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
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {(data?.category_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Enrolments Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            State-Wise Active Technical Seats
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.state_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="state" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Summary Regulatory Stats Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Consolidated Statutory Summary (SIH 2026 Audit)
          </h2>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">AICTE Regulation Bureau</span>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-semibold">Total Approved Intake:</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {data?.kpis?.total_approved_intake || 3900} Seats
            </div>
            <div className="text-[10px] text-slate-500">Across 10 institutions</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-semibold">Actual Enrolment:</span>
            <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {data?.kpis?.total_actual_enrolment || 994}
            </div>
            <div className="text-[10px] text-slate-500">Regular admitted students</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-semibold">Supernumerary Admissions:</span>
            <div className="text-xl font-bold font-mono text-amber-500">
              {data?.kpis?.total_supernumerary || 136}
            </div>
            <div className="text-[10px] text-slate-500">TFW + PMSSS + Sports</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-semibold">International Quotas:</span>
            <div className="text-xl font-bold font-mono text-purple-500">
              {(data?.kpis?.total_nri || 37) + (data?.kpis?.total_foreign_national || 5)}
            </div>
            <div className="text-[10px] text-slate-500">NRI / OCI / Foreign National</div>
          </div>
        </div>
      </div>

    </div>
  );
};
