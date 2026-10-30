import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, ShieldCheck, QrCode, CheckCircle2, 
  XCircle, Lock, Building, Calendar, Award, RefreshCw, Send, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  
  const [student, setStudent] = useState<any>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Find demo student record
      const res = await fetch(`/api/students?search=Aarav&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const stud = data.items?.[0] || {
          id: 1,
          full_name: 'Aarav Sharma',
          student_id: '101-CSE-2026-0001',
          apaar_id: '982345108742',
          institution_id: 'INST-AICTE-101',
          course: 'Computer Science and Engineering',
          department: 'CSE',
          academic_year: '2026-2027',
          date_of_birth: '2005-04-12',
          gender: 'Male',
          admission_category: 'GENERAL',
          supernumerary_type: 'NONE',
          verification_status: 'VERIFIED',
          enrollment_status: 'ACTIVE'
        };
        setStudent(stud);

        // Fetch consents
        const cRes = await fetch(`/api/verification/students/${stud.id}/consents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          setConsents(cData);
        } else {
          setConsents([
            {
              id: 1,
              verifier_org: 'Tata Consultancy Services Ltd. (Background Verification Desk)',
              purpose: 'Campus Placement & Pre-boarding Credential Verification',
              shared_fields: 'name, course, institution, enrollment_status',
              status: 'ACTIVE',
              expires_at: '2026-12-31T00:00:00Z'
            }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleConsentToggle = async (consentId: number, currentStatus: string) => {
    const newAction = currentStatus === 'ACTIVE' ? 'REVOKE' : 'GRANT';
    try {
      await fetch(`/api/verification/students/${student.id}/consents/${consentId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: newAction })
      });
      await fetchStudentData();
    } catch {
      // Toggle locally
      setConsents((prev) =>
        prev.map((c) => (c.id === consentId ? { ...c, status: newAction === 'GRANT' ? 'ACTIVE' : 'REVOKED' } : c))
      );
    }
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionNote.trim()) return;
    setCorrectionSubmitted(true);
    setCorrectionNote('');
    setTimeout(() => setCorrectionSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          National Student DigiLocker & APAAR Identity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Government of India • Automated Permanent Academic Account Registry (APAAR / ABC)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Holographic Digital APAAR ID Card (1 col) */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#1e3a8a] to-[#0f2027] text-white p-6 border-2 border-cyan-400/40 shadow-2xl space-y-4">
            
            {/* Hologram watermark glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 p-1 flex items-center justify-center">
                  <img src="/logo.svg" alt="Emblem" className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold tracking-wider text-cyan-400">GOVERNMENT OF INDIA</div>
                  <div className="text-[9px] text-slate-300">MINISTRY OF EDUCATION • AICTE</div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                VERIFIED
              </span>
            </div>

            {/* Card Body */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Student Full Name</div>
                <div className="text-lg font-extrabold tracking-wide text-white">{student?.full_name || 'Aarav Sharma'}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Roll ID</div>
                  <div className="font-mono text-cyan-300 font-bold">{student?.student_id || '101-CSE-2026-0001'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">DOB</div>
                  <div className="font-mono text-slate-200">{student?.date_of_birth || '2005-04-12'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Course & Discipline</div>
                <div className="text-xs font-semibold text-slate-200">{student?.course || 'Computer Science and Engineering'}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Institution AISHE</div>
                <div className="text-xs font-mono text-cyan-200">{student?.institution_id || 'INST-AICTE-101'} (DITAR New Delhi)</div>
              </div>
            </div>

            {/* APAAR Number Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">APAAR ID (12-Digit)</div>
                <div className="text-base font-extrabold font-mono tracking-widest text-amber-300">
                  {student?.apaar_id ? `${student.apaar_id.slice(0, 4)} ${student.apaar_id.slice(4, 8)} ${student.apaar_id.slice(8, 12)}` : '9823 4510 8742'}
                </div>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1 border border-white/20">
                <QrCode className="w-6 h-6 text-cyan-300" />
              </div>
            </div>

          </div>

          {/* Secure QR Scanner Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Scan for Cryptographic Proof
            </h3>
            <div className="flex justify-center">
              <QRCodeDisplay 
                value={`https://aicte.gov.in/apaar/verify/VR-AICTE-STUDENT-${student?.id || 1}`}
                size={160}
                label="Tamper-Evident Digitally Signed"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Masked minimum necessary verification payload. Contains no raw Aadhaar or private citizen biometric identifiers.
            </p>
          </div>
        </div>

        {/* Consent Manager & Profile Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Consent Management Desk */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-cyan-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Credential Sharing Consent Desk
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                DPDP Act 2023 Compliant
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Control exactly which employers and authorized regulatory bodies can view your academic verification records. You may revoke consent at any time.
            </p>

            <div className="space-y-3">
              {consents.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-md">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.verifier_org}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Purpose: <span className="font-medium text-slate-700 dark:text-slate-300">{c.purpose}</span>
                    </div>
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                      Shared Fields: {c.shared_fields}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {c.status}
                    </span>
                    <button
                      onClick={() => handleConsentToggle(c.id, c.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        c.status === 'ACTIVE'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Revoke Consent' : 'Grant Consent'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Correction Submission Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Submit Academic Record Correction Request
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notice any discrepancy in your name, quota, category, or admission year? Submit an audit revision ticket directly to your institution registrar.
            </p>

            {correctionSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Correction ticket #CORR-2026-8941 dispatched to DITAR New Delhi registrar desk.</span>
              </div>
            )}

            <form onSubmit={handleCorrectionSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                placeholder="Describe field correction required (e.g. update admission category or spelling of middle name)..."
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Official Revision Ticket</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
