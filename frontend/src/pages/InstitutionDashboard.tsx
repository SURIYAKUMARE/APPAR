import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldCheck, AlertTriangle, UserPlus, 
  UploadCloud, RefreshCw, ChevronRight, CheckCircle2, FileSpreadsheet, Zap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Student } from '../types';

interface InstitutionDashboardProps {
  onNavigate: (page: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const instId = user?.institution_id || 'INST-AICTE-101';

  const [compliance, setCompliance] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch compliance
      const compRes = await fetch(`/api/institutions/${instId}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (compRes.ok) {
        const cData = await compRes.json();
        setCompliance(cData);
      }

      // 2. Fetch students
      const studRes = await fetch(`/api/students?institution_id=${instId}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (studRes.ok) {
        const sData = await studRes.json();
        setStudents(sData.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [instId]);

  return (
    <div className="space-y-8">
      
      {/* College Identity Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>AICTE Approval ID: {instId}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {compliance?.institution_name || 'Delhi Institute of Technology & Advanced Research'}
          </h1>
          <p className="text-xs text-slate-300">
            AISHE: C-12001 • Technical & Engineering Category • Academic Year 2026-2027
          </p>
        </div>

        {/* Regulatory Rating Badge */}
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
          <div className="text-right">
            <div className="text-[10px] text-slate-300 uppercase font-semibold">Regulatory Score</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {compliance?.compliance_score || 96.5}%
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Compliance Verified</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('student-registration')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 transition-all text-left shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Register Student</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Individual APAAR entry</div>
        </button>

        <button
          onClick={() => onNavigate('bulk-upload')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all text-left shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Bulk Upload</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">CSV / Excel schema ingest</div>
        </button>

        <button
          onClick={() => onNavigate('offline-center')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all text-left shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Offline Center</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">IndexedDB local sync</div>
        </button>

        <button
          onClick={() => onNavigate('admission-compliance')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-left shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">Intake Auditor</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Approved capacity vs actual</div>
        </button>
      </div>

      {/* Approved Intake vs Actual Enrolment Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Course-Wise Intake Capacity & Quotas (2026-2027)
            </h2>
            <p className="text-xs text-slate-500">Regular intake seats plus authorized 15% supernumerary quota</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
            Total Approved: {compliance?.total_approved_intake || 420} Seats
          </span>
        </div>

        <div className="space-y-4">
          {(compliance?.courses_breakdown || []).map((c: any, idx: number) => {
            const percentage = Math.min(100, Math.round((c.actual_enrolment / c.approved_seats) * 100));
            const isExceeded = c.excess_regular > 0;

            return (
              <div key={idx} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {c.course}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500">
                      Enrolled: <strong className="text-slate-900 dark:text-white">{c.actual_enrolment}</strong> / {c.approved_seats}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">
                      Supernumerary: <strong>{c.supernumerary_count}</strong> / {c.supernumerary_quota}
                    </span>
                    {isExceeded && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Excess +{c.excess_regular}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExceeded ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Registered Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Student Enrollments ({students.length})
            </h2>
            <p className="text-xs text-slate-500">Verified through DigiLocker & ABC Repository</p>
          </div>
          <button
            onClick={() => onNavigate('student-registration')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            + New Admission
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Student Roll ID</th>
                <th className="py-3 px-3">Masked APAAR ID</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Quota</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {s.full_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                    {s.student_id}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400">
                    XXXX-XXXX-{s.apaar_id.slice(-4)}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {s.course}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {s.supernumerary_type !== 'NONE' ? s.supernumerary_type : s.admission_category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      s.verification_status === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : s.verification_status === 'FLAGGED'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {s.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
