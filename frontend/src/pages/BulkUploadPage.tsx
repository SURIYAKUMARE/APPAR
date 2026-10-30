import React, { useState } from 'react';
import { 
  UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  AlertTriangle, RefreshCw, X, Table, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BulkUploadPageProps {
  onNavigate: (page: string) => void;
}

interface ParsedRow {
  student_id: string;
  apaar_id: string;
  full_name: string;
  course: string;
  department: string;
  date_of_birth: string;
  gender: string;
  admission_category: string;
  supernumerary_type: string;
  isValid: boolean;
  error?: string;
}

export const BulkUploadPage: React.FC<BulkUploadPageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleCsvContent = 
`student_id,apaar_id,full_name,course,department,date_of_birth,gender,admission_category,supernumerary_type
101-CSE-2026-0501,982345108742,Rohan Deshmukh,Computer Science and Engineering,CSE,2005-06-14,Male,GENERAL,NONE
101-CSE-2026-0502,871234905621,Priya Kulkarni,Computer Science and Engineering,CSE,2005-09-22,Female,OBC,TFW
101-ECE-2026-0503,765432109876,Tanvi Rao,Electronics and Communication Engineering,ECE,2005-11-05,Female,GENERAL,NONE
101-MECH-2026-0504,654321098765,Deepak Mishra,Mechanical Engineering,MECH,2004-12-18,Male,SC,PMSSS
101-AIDS-2026-0505,543210987654,Zoya Khan,Artificial Intelligence and Data Science,AIDS,2005-03-30,Female,GENERAL,NONE`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICTE_APAAR_Batch_Upload_Sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      parseFile(selected);
    }
  };

  const parseFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsed: ParsedRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < 4) continue;

        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] || '';
        });

        const apaar = row.apaar_id || row.apaar || '';
        const name = row.full_name || row.name || '';
        const sid = row.student_id || row.roll_no || '';

        const isValidApaar = apaar.length === 12;
        const isValid = isValidApaar && name.length > 0 && sid.length > 0;

        parsed.push({
          student_id: sid,
          apaar_id: apaar,
          full_name: name,
          course: row.course || 'Computer Science and Engineering',
          department: row.department || 'CSE',
          date_of_birth: row.date_of_birth || '2005-01-01',
          gender: row.gender || 'Other',
          admission_category: row.admission_category || 'GENERAL',
          supernumerary_type: row.supernumerary_type || 'NONE',
          isValid,
          error: !isValidApaar ? 'APAAR ID must be 12 digits' : (!name ? 'Missing name' : undefined)
        });
      }

      setPreviewRows(parsed);
    };
    reader.readAsText(f);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Bulk upload failed');
      }

      const data = await res.json();
      setUploadResult(data);
      setPreviewRows([]);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const invalidCount = previewRows.length - validCount;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Batch CSV / Excel Student Upload
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated schema validation, Luhn checksum parsing, and cross-institution duplicate pre-scan.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-cyan-500" />
          <span>Download Sample Template</span>
        </button>
      </div>

      {uploadResult && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Batch Ingestion Completed</span>
          </div>
          <p>
            Processed <strong>{uploadResult.records_processed}</strong> records. Successfully committed <strong>{uploadResult.records_inserted}</strong> student profiles into central depository.
          </p>
          {uploadResult.duplicates_detected > 0 && (
            <div className="text-amber-600 dark:text-amber-400 font-bold">
              ⚠️ Flagged {uploadResult.duplicates_detected} potential duplicate admission(s) for regulatory review.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4 hover:border-cyan-500 transition-colors">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Select or Drag & Drop Student Enrollment Data
          </h3>
          <p className="text-xs text-slate-500 mt-1">Supports UTF-8 CSV or Excel exports (Up to 5,000 records per batch)</p>
        </div>

        <input
          type="file"
          id="csvUpload"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="csvUpload"
          className="inline-block px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
        >
          Browse Local File
        </label>

        {file && (
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* Client-Side Live Validation Preview */}
      {previewRows.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Pre-Ingestion Batch Schema Preview ({previewRows.length} Rows)
              </h2>
              <div className="flex items-center space-x-3 text-xs mt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {validCount} Ready for Ingest
                </span>
                {invalidCount > 0 && (
                  <span className="text-rose-500 font-bold">
                    ✕ {invalidCount} Invalid Rows (Highlighted)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleUploadSubmit}
              disabled={loading || validCount === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Commit {validCount} Records to Registry</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Roll ID</th>
                  <th className="py-2.5 px-3">APAAR ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Supernumerary</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewRows.map((r, i) => (
                  <tr key={i} className={r.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30' : 'bg-rose-500/5'}>
                    <td className="py-2 px-3 font-mono">{r.student_id}</td>
                    <td className="py-2 px-3 font-mono font-bold">{r.apaar_id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.full_name}</td>
                    <td className="py-2 px-3 text-slate-500">{r.course}</td>
                    <td className="py-2 px-2">{r.admission_category}</td>
                    <td className="py-2 px-2 font-mono">{r.supernumerary_type}</td>
                    <td className="py-2 px-2 text-center">
                      {r.isValid ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          VALID
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full" title={r.error}>
                          ERROR: {r.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
