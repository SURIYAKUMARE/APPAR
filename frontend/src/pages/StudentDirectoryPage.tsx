import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, Plus, CheckCircle2, Clock, AlertTriangle, 
  XCircle, ChevronRight, ChevronLeft, Eye, EyeOff, Copy, Check, ExternalLink,
  ShieldCheck, FileText, ArrowUpDown, RefreshCw, X, Award, Sparkles, Building2,
  Calendar, Layers, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Student, Institution } from '../types';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

interface StudentDirectoryPageProps {
  onNavigate: (page: string) => void;
}

export const StudentDirectoryPage: React.FC<StudentDirectoryPageProps> = ({ onNavigate }) => {
  const { token, role } = useAuth();

  // State for data
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination state
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSupernumerary, setSelectedSupernumerary] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);

  // Institutions for dropdown filter
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [unmaskedApaarIds, setUnmaskedApaarIds] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Slide-over Drawer Profile state
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'institution' | 'apaar' | 'verification' | 'documents' | 'audit'>('personal');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load institutions for filter
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await fetch('/api/institutions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setInstitutions(list);
        }
      } catch (err) {
        console.error('Failed to load institutions', err);
      }
    };
    loadInstitutions();
  }, [token]);

  // Fetch students from backend API
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedInstitution) params.append('institution_id', selectedInstitution);
      if (selectedCourse) params.append('course', selectedCourse);
      if (selectedStatus) params.append('verification_status', selectedStatus);
      if (selectedSupernumerary && selectedSupernumerary !== 'ALL') {
        params.append('supernumerary_type', selectedSupernumerary);
      }

      const res = await fetch(`/api/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, debouncedSearch, selectedInstitution, selectedCourse, selectedStatus, selectedSupernumerary]);

  // Toggle single mask
  const toggleMask = (id: number) => {
    setUnmaskedApaarIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy APAAR to clipboard
  const copyApaar = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Format APAAR ID: 1234 5678 9012
  const formatApaar = (apaar: string, unmasked: boolean) => {
    if (!apaar) return '—';
    const clean = apaar.replace(/\s+/g, '');
    if (!unmasked) {
      return `•••• •••• ${clean.slice(-4)}`;
    }
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  // Export current list to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Student Name', 'Roll No', 'Institution ID', 'Course', 'Academic Year', 'APAAR ID', 'Status'];
    const rows = (selectedIds.length > 0 ? students.filter(s => selectedIds.includes(s.id)) : students).map(s => [
      s.id,
      `"${s.full_name}"`,
      `"${s.student_id}"`,
      `"${s.institution_id}"`,
      `"${s.course}"`,
      `"${s.academic_year}"`,
      `"${s.apaar_id}"`,
      `"${s.verification_status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apaar_students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Student Directory & Record Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
              {totalCount.toLocaleString()} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized academic records repository, real-time Verhoeff checksum validation, and cross-institutional verification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="m3-btn-secondary text-xs py-2"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => onNavigate('bulk-upload')}
            className="m3-btn-secondary text-xs py-2"
          >
            <Download className="w-3.5 h-3.5 rotate-180" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => onNavigate('student-registration')}
            className="m3-btn-primary text-xs py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="m3-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Advanced Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, APAAR ID, or roll number..."
              className="m3-input w-full pl-9 pr-8"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter by Institution */}
          <div>
            <select
              value={selectedInstitution}
              onChange={(e) => {
                setSelectedInstitution(e.target.value);
                setPage(1);
              }}
              className="m3-input w-full"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.id} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Course */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(1);
              }}
              className="m3-input w-full"
            >
              <option value="">All Courses</option>
              <option value="Computer Science and Engineering">Computer Science & Engg</option>
              <option value="Electronics and Communication Engineering">Electronics & Comm Engg</option>
              <option value="Mechanical Engineering">Mechanical Engg</option>
              <option value="Civil Engineering">Civil Engg</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Artificial Intelligence and Data Science">AI & Data Science</option>
            </select>
          </div>

          {/* Filter by Verification Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="m3-input w-full"
            >
              <option value="">All Verification Statuses</option>
              <option value="VERIFIED">Verified (100% Valid)</option>
              <option value="PENDING">Pending Review</option>
              <option value="FLAGGED">Flagged Anomaly</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

        </div>

        {/* Active Filters / Reset row */}
        {(search || selectedInstitution || selectedCourse || selectedStatus || selectedSupernumerary !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Filtered results: <strong>{totalCount}</strong> matching students
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedInstitution('');
                setSelectedCourse('');
                setSelectedStatus('');
                setSelectedSupernumerary('ALL');
                setPage(1);
              }}
              className="text-[#2457E8] dark:text-cyan-400 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Selection Actions Toolbar (When records selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <CheckSquare className="w-4 h-4 text-[#2457E8]" />
            <span>{selectedIds.length} student record{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#101B36] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              Export Selected
            </button>
            <button
              onClick={() => onNavigate('apaar-verify')}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#2457E8] text-white hover:bg-blue-700"
            >
              Batch Verify APAAR
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Rich Data Table */}
      <div className="m3-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-[#0A1124] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-[#1E2D52]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.length === students.length && students.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#2457E8]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Roll / Reg No</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3">Course & Year</th>
                <th className="py-3 px-3">APAAR ID</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2457E8]" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No student records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isUnmasked = !!unmaskedApaarIds[student.id];

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectOne(student.id)} className="text-slate-400 hover:text-slate-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2457E8]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3 px-3">
                        <div 
                          className="flex items-center gap-2.5 cursor-pointer group"
                          onClick={() => {
                            setActiveStudent(student);
                            setActiveTab('personal');
                          }}
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[11px] group-hover:bg-[#2457E8] group-hover:text-white transition-colors">
                            {student.full_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#2457E8] dark:group-hover:text-[#16C8D8] transition-colors">
                              {student.full_name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {student.gender} • DOB: {student.date_of_birth}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {student.student_id}
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {student.institution_id}
                        </span>
                      </td>

                      {/* Course & Academic Year */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {student.course}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.academic_year}
                        </div>
                      </td>

                      {/* APAAR ID (Mask/Unmask Toggle) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-800 dark:text-slate-200 tracking-wider">
                            {formatApaar(student.apaar_id, isUnmasked)}
                          </span>
                          <button
                            onClick={() => toggleMask(student.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title={isUnmasked ? 'Mask APAAR ID' : 'Unmask APAAR ID'}
                          >
                            {isUnmasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyApaar(student.id, student.apaar_id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Copy APAAR ID"
                          >
                            {copiedId === student.id ? (
                              <Check className="w-3 h-3 text-[#16A36A]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          student.verification_status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : student.verification_status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : student.verification_status === 'FLAGGED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {student.verification_status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                          {student.verification_status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {student.verification_status === 'FLAGGED' && <AlertTriangle className="w-3 h-3" />}
                          {student.verification_status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          <span>{student.verification_status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveStudent(student);
                              setActiveTab('personal');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#2457E8] bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => onNavigate('apaar-verify')}
                            className="p-1.5 text-slate-400 hover:text-[#2457E8] rounded-lg transition-colors"
                            title="Verify in APAAR Gateway"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="m3-input py-1 px-2 text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} records
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2D52] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2D52] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Student Profile (Page 3 Requirement) */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setActiveStudent(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white dark:bg-[#101B36] shadow-2xl border-l border-slate-200 dark:border-[#1E2D52] flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1124]/50 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2457E8] to-[#16C8D8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {activeStudent.full_name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeStudent.full_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono">{activeStudent.student_id}</span>
                      <span>•</span>
                      <span>{activeStudent.institution_id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    activeStudent.verification_status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeStudent.verification_status}</span>
                  </span>
                  <button
                    onClick={() => setActiveStudent(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Tabs Bar (7 Required Tabs) */}
              <div className="flex items-center gap-1 px-6 border-b border-slate-100 dark:border-[#1E2D52] overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'personal'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'academic'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Academic
                </button>
                <button
                  onClick={() => setActiveTab('institution')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'institution'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Institution
                </button>
                <button
                  onClick={() => setActiveTab('apaar')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'apaar'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  APAAR & Checksum
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'verification'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Verification History
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'documents'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'audit'
                      ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Audit Timeline
                </button>
              </div>

              {/* Tab Contents Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Personal Information */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Personal Demographics
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Full Name</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.full_name}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.date_of_birth}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Gender</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.gender}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Admission Category</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.admission_category || 'GENERAL'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Parentage / Guardian Hash</span>
                        <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate block">
                          SHA256:7a9f8c...3b42
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Nationality / Domicile</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">Indian Citizen (Domicile Verified)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Academic Information */}
                {activeTab === 'academic' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Enrolment & Academic Track
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Course / Program</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.course}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Department</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.department || 'Engineering'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Academic Year</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.academic_year}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52]">
                        <span className="text-slate-400 block text-[11px]">Supernumerary Quota</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{activeStudent.supernumerary_type || 'NONE'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Institution Details */}
                {activeTab === 'institution' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Institutional Affiliation
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52] space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Institution ID</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">{activeStudent.institution_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">AISHE Code</span>
                        <span className="font-mono text-slate-900 dark:text-white">C-18923</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">AICTE Approval Status</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">APPROVED</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Affiliated University</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">State Technological University</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. APAAR ID Details & Verhoeff Checksum */}
                {activeTab === 'apaar' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Cryptographic Identity & Checksum
                    </h3>
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-[#0A1124] border border-blue-100 dark:border-[#1E2D52] space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">12-Digit APAAR ID</span>
                        <span className="font-mono text-base font-bold text-[#2457E8] dark:text-[#16C8D8] tracking-widest mt-1 block">
                          {formatApaar(activeStudent.apaar_id, true)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Verhoeff Checksum Algorithm</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VALID CHECKSUM PASS
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">ABC Depository Sync</span>
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Synchronized (Live)</span>
                      </div>
                    </div>

                    <div className="flex justify-center pt-2">
                      <QRCodeDisplay 
                        data={`APAAR:${activeStudent.apaar_id}|NAME:${activeStudent.full_name}|INST:${activeStudent.institution_id}`} 
                        size={140}
                      />
                    </div>
                  </div>
                )}

                {/* 5. Verification History */}
                {activeTab === 'verification' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Third-Party Verification Trail
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">AICTE National Admission Verification</p>
                          <p className="text-[11px] text-slate-400">System Check • Algorithm Verhoeff + Duplicate Index</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">VERIFIED</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Authorized Employer Verification (TCS HR Desk)</p>
                          <p className="text-[11px] text-slate-400">Campus Placement Verification • Consent Token Granted</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2457E8]">CONFIRMED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Uploaded Documents */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Linked Identity Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2457E8]" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">10+2 Marksheet</p>
                            <p className="text-[10px] text-slate-400">OCR Verified</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2457E8]" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Aadhaar e-KYC</p>
                            <p className="text-[10px] text-slate-400">Zero-Knowledge Token</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Audit Timeline */}
                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Immutable Audit Trail
                    </h3>
                    <div className="relative pl-5 border-l border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                      <div className="relative">
                        <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#101B36]" />
                        <p className="font-semibold text-slate-900 dark:text-white">Record Registered in AICTE Central Depository</p>
                        <p className="text-[11px] text-slate-400">By Institution Registrar • 2026-10-15 10:24:12</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#101B36]" />
                        <p className="font-semibold text-slate-900 dark:text-white">APAAR ID Checksum Validated</p>
                        <p className="text-[11px] text-slate-400">Automated Verhoeff Engine • Checksum Pass</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1124]/50 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('apaar-verify')}
                  className="m3-btn-primary text-xs py-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify in Gateway</span>
                </button>
                <button
                  onClick={() => setActiveStudent(null)}
                  className="m3-btn-secondary text-xs py-2"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
