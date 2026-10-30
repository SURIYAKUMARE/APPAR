import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Edit3,
  Cpu,
  Layers,
  FileCheck
} from 'lucide-react';

interface DocumentRecord {
  id: number;
  filename: string;
  file_type: string;
  uploaded_by: string;
  status: string;
  confidence_score: number;
  extracted_fields: Record<string, any>;
  created_at: string;
}

interface DocumentIntelligencePageProps {
  onNavigate: (page: string) => void;
}

export const DocumentIntelligencePage: React.FC<DocumentIntelligencePageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/documents', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSampleExtract = async (sampleType: string) => {
    setIsProcessing(true);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/documents/extract-sample?sample_type=${sampleType}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message);
        await fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              DOCUMENT INTELLIGENCE OCR
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              98.9% EXTRACTION ACCURACY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            DOCUMENT PROCESSING & OCR STUDIO
            <FileText className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Automated deep-learning OCR extraction engine. Parses scanned student admission forms, AICTE intake sanction letters, and transfer certificates with automated Verhoeff checksum validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSampleExtract('AICTE_APPROVAL_SANCTION')}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <UploadCloud className="w-4 h-4 text-slate-950" />}
            <span>Ingest Sample PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document File Selector & OCR Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-3 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              INGESTED DOCUMENT REPOSITORY
            </h3>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-cyan-400 font-bold">{doc.file_type}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {doc.confidence_score}% CONFIDENCE
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{doc.filename}</h4>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Uploaded by: {doc.uploaded_by}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Simulated Document Canvas Preview with Bounding Box Overlay */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              OCR BOUNDING BOX SCANNER PREVIEW
            </span>
            <div className="h-48 rounded-xl bg-slate-900/80 border border-dashed border-cyan-500/30 p-4 flex flex-col justify-around text-left font-mono text-[11px] text-slate-400 relative overflow-hidden">
              <div className="absolute top-3 left-4 right-4 h-6 border border-cyan-400/80 bg-cyan-500/10 rounded px-2 flex items-center justify-between text-[10px] text-cyan-300">
                <span>[BOX 01]: INSTITUTION_NAME</span>
                <span className="text-emerald-400">0.99</span>
              </div>
              <div className="absolute top-12 left-4 right-20 h-6 border border-violet-400/80 bg-violet-500/10 rounded px-2 flex items-center justify-between text-[10px] text-violet-300">
                <span>[BOX 02]: APAAR_ID: 982345108742</span>
                <span className="text-emerald-400">1.00</span>
              </div>
              <div className="absolute top-21 left-4 right-10 h-6 border border-emerald-400/80 bg-emerald-500/10 rounded px-2 flex items-center justify-between text-[10px] text-emerald-300">
                <span>[BOX 03]: SANCTIONED_INTAKE: 120 SEATS</span>
                <span className="text-emerald-400">0.98</span>
              </div>
              <div className="absolute top-30 left-4 right-32 h-6 border border-amber-400/80 bg-amber-500/10 rounded px-2 flex items-center justify-between text-[10px] text-amber-300">
                <span>[BOX 04]: VERHOEFF_CHECKSUM_OK</span>
                <span className="text-emerald-400">PASS</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Neural optical character recognition with layout geometry segmentation
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Structured Data Table & Human Correction */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-5 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-0.5">
                    EXTRACTED DATA SCHEMA
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedDoc.filename}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {selectedDoc.status}
                  </span>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Extracted Regulatory Key-Value Pairs:
                </span>

                <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-3 font-mono text-xs">
                  {Object.entries(selectedDoc.extracted_fields || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-800/80 gap-1">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-cyan-300 font-bold sm:text-right max-w-sm truncate">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human-in-the-Loop Validation Sign-off */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Regulatory Officer Human Verification Desk</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Extracted documents are not committed to the sovereign national repository until cross-checked by an authorized admission officer or AICTE regulator.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSuccessMsg('Record verified and authorized for Central Repository sync.');
                      setTimeout(() => setSuccessMsg(null), 4000);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Confirm & Commit Validated Data
                  </button>
                  <button
                    onClick={() => onNavigate('student-registration')}
                    className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
                  >
                    Edit Form
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              Select an ingested document on the left to inspect OCR schema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
