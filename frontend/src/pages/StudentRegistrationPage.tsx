import React, { useState } from 'react';
import { 
  UserPlus, ShieldCheck, AlertTriangle, CheckCircle2, 
  RefreshCw, WifiOff, FileCheck2, Zap, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';

interface StudentRegistrationPageProps {
  onNavigate: (page: string) => void;
}

export const StudentRegistrationPage: React.FC<StudentRegistrationPageProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { effectiveOnline, queueStudentOffline } = useOffline();

  const [fullName, setFullName] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('Computer Science and Engineering');
  const [department, setDepartment] = useState('CSE');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [admissionYear, setAdmissionYear] = useState(2026);
  const [dob, setDob] = useState('2005-01-01');
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('GENERAL');
  const [supernumerary, setSupernumerary] = useState('NONE');
  const [nri, setNri] = useState(false);
  const [oci, setOci] = useState(false);
  const [fn, setFn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    // Form validations
    if (apaarId.replace(/\D/g, '').length !== 12) {
      setError('APAAR ID must contain exactly 12 numeric digits.');
      return;
    }

    if (!studentId.trim() || !fullName.trim()) {
      setError('Student Roll ID and Full Name are mandatory fields.');
      return;
    }

    setLoading(true);

    const instId = user?.institution_id || 'INST-AICTE-101';
    const payload = {
      student_id: studentId.trim(),
      apaar_id: apaarId.trim(),
      full_name: fullName.trim(),
      institution_id: instId,
      course,
      department,
      academic_year: academicYear,
      admission_year: admissionYear,
      date_of_birth: dob,
      gender,
      admission_category: category,
      supernumerary_type: supernumerary,
      nri_status: nri,
      oci_status: oci,
      foreign_national: fn,
      is_offline_provisional: !effectiveOnline
    };

    // If offline, queue in IndexedDB
    if (!effectiveOnline) {
      try {
        const queuedId = await queueStudentOffline(payload);
        setSuccessResult({
          is_offline: true,
          student_id: studentId,
          full_name: fullName,
          message: 'Saved to local encrypted IndexedDB. Provisional registration generated. Record will synchronize when connection restores.',
          queued_id: queuedId
        });
        resetForm();
      } catch (err: any) {
        setError(`Failed to save offline: ${err.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Online submission
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Registration failed');
      }

      const data = await res.json();
      setSuccessResult({
        is_offline: false,
        student_id: data.student_id,
        full_name: data.full_name,
        verification_status: data.verification_status,
        message: 'Successfully registered in Central AICTE Student Depository.'
      });
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setApaarId('');
    setStudentId('');
    setSupernumerary('NONE');
    setNri(false);
    setOci(false);
    setFn(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Individual Student Registration Form
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official AICTE APAAR Enrollment Desk • Supports Real-Time Validation & Offline-First Queuing.
          </p>
        </div>

        {/* Offline indicator badge */}
        {!effectiveOnline && (
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center space-x-1.5 animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Mode Active</span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successResult && (
        <div className={`p-5 rounded-2xl border text-xs space-y-2 ${
          successResult.is_offline 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            {successResult.is_offline ? <Zap className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <span>{successResult.is_offline ? 'Provisional Offline Record Queued' : 'Registration Complete'}</span>
          </div>
          <p>{successResult.message}</p>
          <div className="font-mono text-[11px] pt-1 border-t border-current/10">
            Candidate: <strong>{successResult.full_name}</strong> • Roll ID: <strong>{successResult.student_id}</strong>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 pb-2 border-b border-slate-200 dark:border-slate-700">
            1. Candidate Identification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aditi Gupta"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                12-Digit APAAR ID *
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={apaarId}
                onChange={(e) => setApaarId(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 982345108742"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Institution Roll / Reg ID *
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 101-CSE-2026-0042"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Admission Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="GENERAL">General / Open</option>
                <option value="OBC">OBC (Non-Creamy Layer)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            2. Academic Discipline & Quotas
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enrolled Course *
              </label>
              <select
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  if (e.target.value.includes('Computer')) setDepartment('CSE');
                  else if (e.target.value.includes('Electronics')) setDepartment('ECE');
                  else if (e.target.value.includes('Mechanical')) setDepartment('MECH');
                  else if (e.target.value.includes('Intelligence')) setDepartment('AIDS');
                  else setDepartment('IT');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Supernumerary Quota Status *
              </label>
              <select
                value={supernumerary}
                onChange={(e) => setSupernumerary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="NONE">None (Regular Approved Seat)</option>
                <option value="TFW">TFW - Tuition Fee Waiver Scheme (5% Quota)</option>
                <option value="PMSSS">PMSSS - Prime Minister's Special Scholarship</option>
                <option value="DEFENSE">Defense Personnel Ward</option>
                <option value="SPORTS">Sports & Cultural Quota</option>
              </select>
            </div>
          </div>

          {/* International / NRI flags */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              International & Special Categories
            </span>
            <div className="flex flex-wrap gap-6 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nri}
                  onChange={(e) => setNri(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Non-Resident Indian (NRI Quota)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oci}
                  onChange={(e) => setOci(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Overseas Citizen of India (OCI)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fn}
                  onChange={(e) => setFn(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Foreign National (FN Quota)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">
              {effectiveOnline ? '● Central Gateway Connected' : '○ Offline Mode • Local IndexedDB'}
            </span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-cyan-500/20 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{effectiveOnline ? 'Register in Central Depository' : 'Save to Offline Queue'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
};
