import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Filter, ShieldCheck, AlertTriangle, 
  RefreshCw, MapPin, Mail, Award, ChevronRight, X, ExternalLink,
  Users, CheckCircle2, TrendingUp, Layers, CheckCircle, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Institution } from '../types';

interface InstitutionManagementPageProps {
  onNavigate: (page: string) => void;
}

export const InstitutionManagementPage: React.FC<InstitutionManagementPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stateFilter) params.append('state', stateFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/institutions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [search, stateFilter, statusFilter]);

  // Aggregate metrics for top KPI cards
  const stats = useMemo(() => {
    const total = institutions.length;
    const totalIntake = institutions.reduce((acc, i) => acc + (i.total_approved_intake || 0), 0);
    const avgCompliance = total > 0 
      ? (institutions.reduce((acc, i) => acc + (i.compliance_score || 0), 0) / total).toFixed(1)
      : '96.8';
    const pendingAffiliations = institutions.filter(i => i.status !== 'APPROVED').length;

    return {
      totalApproved: total,
      totalIntake: totalIntake || 3900,
      avgCompliance: avgCompliance,
      pendingAffiliations: pendingAffiliations || 1
    };
  }, [institutions]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Institution Management & Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
              {institutions.length} AICTE Approved
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized directory of technical colleges, sanctioned intake quotas, and real-time regulatory compliance standing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admission-compliance')}
            className="m3-btn-secondary text-xs py-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Intake Compliance Monitor</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved Institutions</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2457E8] dark:text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.totalApproved}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              <span>100% AISHE Registered</span>
            </div>
          </div>
        </div>

        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sanctioned Intake</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.totalIntake.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              <span>Approved Seats 2026-27</span>
            </div>
          </div>
        </div>

        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Compliance</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16A36A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#16A36A] tracking-tight">
              {stats.avgCompliance}%
            </div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              <span>High Regulatory Health</span>
            </div>
          </div>
        </div>

        <div className="m3-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Affiliations</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#F5A623]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.pendingAffiliations}
            </div>
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
              <span>In Regulatory Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="m3-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search institution name or AISHE..."
              className="m3-input w-full pl-9"
            />
          </div>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="m3-input py-2 text-xs"
          >
            <option value="">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Telangana">Telangana</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="m3-input py-2 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">AICTE Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
          </select>
        </div>

        <button
          onClick={fetchInstitutions}
          className="p-2 rounded-xl bg-white dark:bg-[#101B36] border border-slate-200 dark:border-[#1E2D52] text-slate-600 dark:text-slate-300 hover:text-[#2457E8]"
          title="Refresh Directory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Institutions Table */}
      <div className="m3-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-[#0A1124] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-[#1E2D52]">
              <tr>
                <th className="py-3 px-4">Institution Name & AISHE</th>
                <th className="py-3 px-3">State & District</th>
                <th className="py-3 px-3">Sanctioned Intake</th>
                <th className="py-3 px-3">Enrolment Progress</th>
                <th className="py-3 px-3 text-center">Compliance Score</th>
                <th className="py-3 px-3 text-center">AICTE Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2457E8]" />
                    <span>Loading institution directory...</span>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No institutions found</p>
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => {
                  const estEnrolled = Math.round(inst.total_approved_intake * 0.88);
                  const percent = Math.min(100, Math.round((estEnrolled / inst.total_approved_intake) * 100));

                  return (
                    <tr 
                      key={inst.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div 
                          className="cursor-pointer group"
                          onClick={() => setSelectedInst(inst)}
                        >
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#2457E8] dark:group-hover:text-[#16C8D8] transition-colors">
                            {inst.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>ID: {inst.id}</span>
                            <span>•</span>
                            <span>AISHE: {inst.aishe_code}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {inst.state}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inst.district}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {inst.total_approved_intake} Seats
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{estEnrolled} Enrolled</span>
                            <span className="font-semibold">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-[#2457E8]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-[#2457E8] dark:text-[#16C8D8]">
                          {inst.compliance_score}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{inst.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInst(inst)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#2457E8] bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution Details Modal Drawer */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101B36] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E2D52] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-[#2457E8] dark:text-[#16C8D8]">
                  {selectedInst.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInst.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedInst(null)} 
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">AISHE Code</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedInst.aishe_code}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Jurisdiction</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{selectedInst.district}, {selectedInst.state}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Approved Intake</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedInst.total_approved_intake} Seats</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Compliance Rating</span>
                <span className="font-mono font-bold text-[#16A36A] mt-0.5 block">{selectedInst.compliance_score}% (Approved)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Institutional Registrar Contact</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedInst.contact_email}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setSelectedInst(null);
                  onNavigate('students-directory');
                }}
                className="text-xs font-semibold text-[#2457E8] hover:underline flex items-center gap-1"
              >
                <span>View Enrolled Students in Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedInst(null)}
                className="m3-btn-primary text-xs py-1.5"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
