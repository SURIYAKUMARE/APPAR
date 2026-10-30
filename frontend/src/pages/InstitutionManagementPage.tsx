import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, ShieldCheck, AlertTriangle, 
  RefreshCw, MapPin, Mail, Award, ChevronRight, X 
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
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stateFilter) params.append('state', stateFilter);

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
  }, [search, stateFilter]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AICTE Approved Institutions Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central repository of technical institutes, AISHE codes, approved capacities, and regulatory standing.
          </p>
        </div>

        {/* Search & State Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, AISHE or code..."
              className="pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 w-56"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Telangana">Telangana</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>

          <button
            onClick={fetchInstitutions}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            onClick={() => setSelectedInst(inst)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 transition-all cursor-pointer shadow-sm space-y-3 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                    {inst.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    AISHE: {inst.aishe_code}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                  {inst.name}
                </h3>
              </div>

              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                inst.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}>
                {inst.status}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{inst.district}, {inst.state}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Intake: <strong className="text-slate-900 dark:text-white">{inst.total_approved_intake}</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Compliance Rating:</span>
              <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {inst.compliance_score}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Institution Details Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-cyan-500">{selectedInst.id}</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedInst.name}</h3>
              </div>
              <button onClick={() => setSelectedInst(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 font-semibold">AISHE Code:</span>
                  <div className="font-mono font-bold mt-1 text-slate-900 dark:text-white">{selectedInst.aishe_code}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 font-semibold">Location:</span>
                  <div className="font-semibold mt-1 text-slate-900 dark:text-white">{selectedInst.district}, {selectedInst.state}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 font-semibold">Approved Intake:</span>
                  <div className="font-mono font-bold mt-1 text-cyan-600 dark:text-cyan-400">{selectedInst.total_approved_intake} Seats</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 font-semibold">Compliance Standing:</span>
                  <div className="font-mono font-bold mt-1 text-emerald-500">{selectedInst.compliance_score}% ({selectedInst.status})</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <span className="text-slate-400 font-semibold">Contact Registry:</span>
                <div className="font-mono mt-1 text-slate-700 dark:text-slate-300">{selectedInst.contact_email}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInst(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
