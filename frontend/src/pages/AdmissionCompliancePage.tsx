import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, AlertTriangle, ShieldCheck, CheckCircle2, 
  Building2, ChevronRight, RefreshCw, BarChart2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdmissionCompliancePageProps {
  onNavigate: (page: string) => void;
}

export const AdmissionCompliancePage: React.FC<AdmissionCompliancePageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [selectedInst, setSelectedInst] = useState(user?.institution_id || 'INST-AICTE-107');
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/institutions/${selectedInst}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplianceData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [selectedInst]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admission Intake & Quota Compliance Auditor
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated evaluation of actual regular enrollments vs approved ceilings and supernumerary caps (AICTE Approval Process Handbook).
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedInst}
            onChange={(e) => setSelectedInst(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="INST-AICTE-107">INST-AICTE-107 (UP Tech - Excess Intake Breach)</option>
            <option value="INST-AICTE-101">INST-AICTE-101 (DITAR New Delhi - Compliant)</option>
            <option value="INST-AICTE-102">INST-AICTE-102 (National College Tamil Nadu)</option>
            <option value="INST-AICTE-104">INST-AICTE-104 (Karnataka Apex Academy)</option>
          </select>
          <button
            onClick={fetchCompliance}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Compliance Overview Banner */}
      {complianceData && (
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          complianceData.total_excess > 0
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                complianceData.total_excess > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {complianceData.total_excess > 0 ? 'REGULATORY VIOLATION FLAGGED' : 'FULLY COMPLIANT'}
              </span>
              <span className="font-mono text-xs font-bold">{complianceData.institution_id}</span>
            </div>
            <h2 className="text-xl font-extrabold">{complianceData.institution_name}</h2>
            <p className="text-xs max-w-xl">
              {complianceData.total_excess > 0
                ? `Breach: Total regular enrollment exceeds approved seat quota by ${complianceData.total_excess} students in high-demand streams. AICTE Clause 7.2 penalty advisory active.`
                : 'All courses and supernumerary quotas operate strictly within statutory AICTE intake limits.'}
            </p>
          </div>

          <div className="flex items-center space-x-6 text-center shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Approved Intake</div>
              <div className="text-2xl font-bold font-mono">{complianceData.total_approved_intake}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Actual Enrolled</div>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {complianceData.total_actual_enrolment}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Supernumerary</div>
              <div className="text-2xl font-bold font-mono text-amber-500">
                {complianceData.total_supernumerary}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course-By-Course Audit Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Course-Wise Quota Breakdown (Academic Year 2026-2027)
          </h2>
          <p className="text-xs text-slate-500">Regular intake seats vs approved supernumerary capacity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Discipline / Course</th>
                <th className="py-3 px-3 text-center">Approved Regular</th>
                <th className="py-3 px-3 text-center">Actual Regular</th>
                <th className="py-3 px-3 text-center">Regular Variance</th>
                <th className="py-3 px-3 text-center">Supernumerary Quota</th>
                <th className="py-3 px-3 text-center">Supernumerary Enrolled</th>
                <th className="py-3 px-3 text-center">Statutory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(complianceData?.courses_breakdown || []).map((row: any, i: number) => {
                const isViolation = row.excess_regular > 0;
                return (
                  <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isViolation ? 'bg-rose-500/5' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {row.course}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {row.approved_seats}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {row.regular_count}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {row.excess_regular > 0 ? (
                        <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          +{row.excess_regular} EXCESS
                        </span>
                      ) : (
                        <span className="text-emerald-500">0 (OK)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {row.supernumerary_quota}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {row.supernumerary_count}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        row.compliant
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {row.compliant ? 'COMPLIANT' : 'BREACH'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
