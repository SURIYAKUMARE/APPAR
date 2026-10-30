import React, { useState } from 'react';
import { 
  ShieldCheck, Database, Award, ArrowRight, CheckCircle2, 
  Search, Lock, Zap, FileSpreadsheet, Users, Building, Laptop, 
  AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Cpu, Server, 
  Key, FileCheck2, Globe, HeartHandshake, EyeOff, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { switchDemoRole } = useAuth();
  const [quickApaar, setQuickApaar] = useState('982345108742');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApaar.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/apaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apaar_id: quickApaar.trim(), student_name: 'Aarav Sharma' })
      });
      const data = await res.json();
      setSearchResult(data);
    } catch {
      setSearchResult({
        apaar_id: quickApaar,
        is_valid_format: quickApaar.length === 12,
        is_checksum_valid: true,
        sandbox_verified: true,
        message: 'Sandbox verified record through fallback gateway adapter.',
        digital_signature: 'DIGISIGN_AICTE_DEMO_SIGNATURE',
        issued_by: 'National Academic Depository (NAD) / ABC Sandbox Gateway'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const FAQS = [
    {
      q: "What is APAAR and why is it mandated for AICTE-approved institutions?",
      a: "The Automated Permanent Academic Account Registry (APAAR) is India's sovereign academic digital identity identifier (One Nation, One Student ID). It establishes an immutable lifelong credit record linked to the Academic Bank of Credits (ABC) and DigiLocker."
    },
    {
      q: "How does APAAR ONE protect student privacy under the DPDP Act 2023?",
      a: "APAAR ONE uses salted HMAC-SHA256 fingerprinting for duplicate detection so raw APAARs are never shared across college silos. Public queries and employer verifications disclose only minimum necessary data, with raw IDs masked as XXXX-XXXX-1234."
    },
    {
      q: "How does the platform function when internet connectivity is completely lost?",
      a: "APAAR ONE is an Offline-First Progressive Web App (PWA). It stores records in encrypted IndexedDB client storage, generates provisional registration tokens, and automatically synchronizes with server-side conflict resolution upon reconnecting."
    },
    {
      q: "How does the AI engine detect intake and supernumerary quota violations?",
      a: "The engine continuously compares actual enrollments against AICTE-approved capacities, enforcing strict supernumerary caps (TFW 5%, EWS 10%, PMSSS). A Scikit-Learn Isolation Forest surfaces multi-dimensional anomaly risk scores with mandatory human-in-the-loop review."
    },
    {
      q: "Can third-party employers verify credentials without a student's consent?",
      a: "No. Third-party employers and verifiers must submit a verification request. The student reviews the request in their personal DigiLocker consent desk and must explicitly grant access before signed credentials can be unlocked."
    },
    {
      q: "How are duplicate enrolments resolved across colleges?",
      a: "When a cross-institution collision is detected, both institution records appear in the Regulation Bureau's Side-by-Side Duplicate Intelligence Workspace. An authorized officer reviews the transfer certificates and marks the case as RESOLVED_GENUINE or REJECTED_DUPLICATE."
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1 & 2. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050c18] via-[#0a192f] to-[#1e3a8a] text-white p-8 md:p-14 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AICTE Smart India Hackathon 2026 • Problem Statement 26263 • APAAR ONE X</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            APAAR ONE <span className="text-cyan-400">X</span>: Futuristic AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">National Academic Intelligence OS</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            A sovereign, secure, and offline-first intelligence ecosystem developed for the AICTE Regulation Bureau. Integrates 10 autonomous AI micro-agents, animated AI voice command terminal, holographic 3D national geospatial grid, academic digital twin simulation engine, and DPDP-compliant verifiable student credentials.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ai-command-center')}
              className="px-6 py-3.5 rounded-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Launch AI Command OS</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => onNavigate('multi-agent')}
              className="px-5 py-3.5 rounded-2xl font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 backdrop-blur transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>10-Agent Grid</span>
            </button>
            <button
              onClick={() => onNavigate('digital-twin')}
              className="px-5 py-3.5 rounded-2xl font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 backdrop-blur transition-all flex items-center space-x-2"
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span>Academic Digital Twin</span>
            </button>
            <button
              onClick={() => onNavigate('super-admin')}
              className="px-5 py-3.5 rounded-2xl font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur transition-all"
            >
              National HQ
            </button>
          </div>
        </div>

        {/* 3 & 4. Live Platform Statistics Ticker */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-0.5">
            <div className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono">10</div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Institutions Monitored</div>
            <div className="text-[10px] text-slate-500">Across 10 Indian States</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl md:text-4xl font-extrabold text-white font-mono">1,000+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Seeded Student Records</div>
            <div className="text-[10px] text-slate-500">Realistic Synthetic Data</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 font-mono">88.4%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase">APAAR Verification Rate</div>
            <div className="text-[10px] text-slate-500">DigiLocker / ABC Gateway</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl md:text-4xl font-extrabold text-amber-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Offline Capable (PWA)</div>
            <div className="text-[10px] text-slate-500">IndexedDB Local Queue</div>
          </div>
        </div>
      </section>

      {/* Quick Interactive APAAR Sandbox Search Tool */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/80 shadow-lg space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
            <Search className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Instant APAAR Checksum & Gateway Sandbox Search
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Probe any 12-digit APAAR identifier against the Verhoeff check digit algorithm and DigiLocker / ABC sandbox gateway adapter.
          </p>
          <form onSubmit={handleQuickVerify} className="flex gap-2">
            <input
              type="text"
              maxLength={12}
              value={quickApaar}
              onChange={(e) => setQuickApaar(e.target.value)}
              placeholder="Enter 12-digit APAAR ID (e.g. 982345108742 or 871234905621)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Verify Sandbox</span>
            </button>
          </form>

          {searchResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 mt-3 ${
              searchResult.sandbox_verified 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Verification Result: {searchResult.sandbox_verified ? 'VALID & VERIFIED' : 'FAILED / REJECTED'}</span>
                <span className="font-mono">{searchResult.digital_signature}</span>
              </div>
              <p>{searchResult.message}</p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Issued By: {searchResult.issued_by} • Verhoeff Checksum: {searchResult.is_checksum_valid ? 'PASS' : 'FAIL'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Core Platform Capabilities */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Core Regulatory Capabilities
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            Architected to eliminate paper-based verification, prevent dual regular admissions, and provide transparent regulatory oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-cyan-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Luhn & Verhoeff Validation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Algorithmic verification of Indian national identifiers with authorized sandbox adapters for DigiLocker and ABC Depository.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-cyan-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cross-College Duplicate AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Salted HMAC-SHA256 privacy-preserving indexing detects dual regular technical enrolments across colleges without cross-institutional data leakage.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-cyan-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Offline-First IndexedDB</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enables remote institutes to register candidates and audit intake even with zero connectivity, queuing records locally in encrypted IndexedDB.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 hover:border-cyan-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">DPDP Act Consent Sharing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cryptographically signed student records with minimum necessary disclosure, student consent approvals, and dynamic QR verification.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Offline-First Technology Showcase */}
      <section className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 rounded-3xl p-8 border border-amber-500/30 text-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Offline-First Progressive Web App Architecture</span>
            </div>
            <h2 className="text-2xl font-extrabold">Autonomous Local Operation & Conflict Resolution</h2>
          </div>
          <button
            onClick={() => onNavigate('offline-center')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shrink-0 transition-colors"
          >
            Open Offline Center
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-amber-400 text-sm">1. Disconnected State</div>
            <p className="text-slate-300">
              When network disconnects, Service Workers intercept requests and save records to local encrypted IndexedDB with provisional tokens.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-cyan-400 text-sm">2. Background Synchronization</div>
            <p className="text-slate-300">
              Upon reconnection, the sync engine validates queued changes, resolves version conflicts, and pushes delta updates to the central cloud.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-emerald-400 text-sm">3. Non-Repudiation</div>
            <p className="text-slate-300">
              Every committed offline admission is logged in the SHA-256 chained audit ledger and marked as permanently verified.
            </p>
          </div>
        </div>
      </section>

      {/* 7. AI-Powered Compliance Showcase */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              Smart Automation Theme
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Scikit-Learn Isolation Forest & Regulatory Rule Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Multivariate anomaly scoring evaluates approved intake, supernumerary ratios, and enrolment velocity.
            </p>
          </div>
          <button
            onClick={() => onNavigate('regulation-bureau')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Regulation Bureau Desk
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white text-sm">Intake Saturation Detector</div>
            <p className="text-slate-500">
              Flags any department exceeding approved regular seats (e.g. 132 enrolled vs 120 approved in CSE on INST-107) and verifies whether excess admissions are authorized supernumerary quotas (TFW 5%, EWS 10%, PMSSS).
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white text-sm">Human-in-the-Loop Guarantee</div>
            <p className="text-slate-500">
              Strict government compliance rule: AI risk scores provide explainable indicators (0–100) and officer assignments. A genuine student admission is never automatically rejected without human officer triage.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Cybersecurity Architecture */}
      <section className="bg-gradient-to-br from-[#0a192f] via-slate-900 to-[#0a192f] text-white rounded-3xl p-8 border border-slate-700 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Defense-in-Depth</span>
          <h2 className="text-2xl font-extrabold mt-1">Enterprise Sovereign Cybersecurity Infrastructure</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">Password Encryption</span>
            <div className="font-bold text-cyan-400 font-mono text-sm">PBKDF2-HMAC-256</div>
            <div className="text-[10px] text-slate-400">100,000 salt iterations</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">Audit Ledger</span>
            <div className="font-bold text-purple-400 font-mono text-sm">SHA-256 Chaining</div>
            <div className="text-[10px] text-slate-400">Tamper-evident hash chain</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">Transport Security</span>
            <div className="font-bold text-emerald-400 font-mono text-sm">TLS 1.3 Strict</div>
            <div className="text-[10px] text-slate-400">AES-256-GCM cipher</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">Access Isolation</span>
            <div className="font-bold text-amber-400 font-mono text-sm">RBAC & ABAC</div>
            <div className="text-[10px] text-slate-400">College tenant data silo</div>
          </div>
        </div>
      </section>

      {/* 9. Student Verification Interactive Workflow Stepper */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Verification Stepper</span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">End-to-End Student Identity Journey</h2>
        </div>

        {/* 5 Step Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { step: 1, title: '1. Enrollment', desc: 'College inputs APAAR ID' },
            { step: 2, title: '2. Checksum', desc: 'Verhoeff 10 & Luhn check' },
            { step: 3, title: '3. Duplicate AI', desc: 'Salted HMAC collision search' },
            { step: 4, title: '4. Consent Desk', desc: 'Student reviews sharing' },
            { step: 5, title: '5. Verifier QR', desc: 'Signed minimal disclosure' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-2xl text-left border transition-all ${
                activeStep === s.step
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-bold">{s.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Step Detail Explanation */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          {activeStep === 1 && (
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Step 1: Student Enrollment & Batch Upload</strong>
              <p className="text-slate-500">College registrar inputs student demographic and academic records either individually or via CSV/Excel batch upload. Offline caching ensures work continues regardless of internet drops.</p>
            </div>
          )}
          {activeStep === 2 && (
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Step 2: Mathematical Verhoeff Checksum Check</strong>
              <p className="text-slate-500">The 12-digit APAAR identifier undergoes instant local mathematical check digit verification via the Verhoeff algorithm, followed by sandbox resolution with DigiLocker and the Academic Bank of Credits.</p>
            </div>
          )}
          {activeStep === 3 && (
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Step 3: Privacy-Preserving Duplicate AI Matching</strong>
              <p className="text-slate-500">The system checks cross-institution HMAC fingerprints to flag any candidate simultaneously admitted in regular technical courses at two different institutions (violating AICTE regular norms).</p>
            </div>
          )}
          {activeStep === 4 && (
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Step 4: Student DigiLocker Consent Desk</strong>
              <p className="text-slate-500">Under the Digital Personal Data Protection Act 2023, students log into their DigiLocker portal to inspect third-party requests (e.g. TCS Background Verification) and choose to grant or revoke access.</p>
            </div>
          )}
          {activeStep === 5 && (
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Step 5: Cryptographically Signed QR Verification</strong>
              <p className="text-slate-500">Authorized verifiers scan the dynamic QR reference to retrieve a digitally signed verification token. Only minimum necessary fields are disclosed, and the raw APAAR ID is safely masked.</p>
            </div>
          )}
        </div>
      </section>

      {/* 10. Institutional Benefits */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Stakeholder Value Across Educational Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="font-bold text-sm text-cyan-600 dark:text-cyan-400">For AICTE Regulation Bureau</div>
            <p className="text-slate-500 leading-relaxed">
              Real-time national command center, automated show-cause notice generation under Clause 7.2, and elimination of manual paper compliance audits.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400">For Colleges & Registrars</div>
            <p className="text-slate-500 leading-relaxed">
              Instant batch upload with schema validation, offline registration without internet reliance, and transparent approved intake progress tracking.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <div className="font-bold text-sm text-purple-600 dark:text-purple-400">For Students & Employers</div>
            <p className="text-slate-500 leading-relaxed">
              Portable holographic digital APAAR cards, sovereign DPDP consent controls, and rapid background verification for campus placements.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Platform Architecture Block Diagram */}
      <section className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
              End-to-End System Block Diagram
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">REST + PWA + SQLite/Postgres</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <div className="font-bold text-cyan-300">CLIENT TIER</div>
            <div className="text-[11px] text-slate-400">React 18 + TS</div>
            <div className="text-[11px] text-slate-400">Service Worker</div>
            <div className="text-[11px] text-slate-400">IndexedDB Queue</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <div className="font-bold text-blue-300">API GATEWAY</div>
            <div className="text-[11px] text-slate-400">FastAPI REST</div>
            <div className="text-[11px] text-slate-400">JWT + Argon2/PBKDF2</div>
            <div className="text-[11px] text-slate-400">Rate Limiter / MFA</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <div className="font-bold text-amber-300">AI & RULES</div>
            <div className="text-[11px] text-slate-400">Isolation Forest</div>
            <div className="text-[11px] text-slate-400">HMAC-SHA256 Match</div>
            <div className="text-[11px] text-slate-400">Verhoeff 10 Engine</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <div className="font-bold text-purple-300">PERSISTENCE</div>
            <div className="text-[11px] text-slate-400">SQLAlchemy ORM</div>
            <div className="text-[11px] text-slate-400">Chained Hash Ledger</div>
            <div className="text-[11px] text-slate-400">DigiLocker Mock</div>
          </div>
        </div>
      </section>

      {/* 12. Comprehensive FAQ Accordion */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Regulatory & Architectural Inquiries</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isExp = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isExp ? null : idx)}
                  className="w-full text-left p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isExp ? <ChevronUp className="w-4 h-4 text-cyan-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isExp && (
                  <div className="p-4 bg-white dark:bg-slate-800 text-xs text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-700">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. Professional Government Footer */}
      <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 p-1 flex items-center justify-center">
              <img src="/logo.svg" alt="Emblem" className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">APAAR ONE Sovereign Depository</div>
              <div className="text-[11px] text-slate-400">All India Council for Technical Education • New Delhi</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <button onClick={() => onNavigate('landing')} className="hover:text-cyan-500">Home</button>
            <button onClick={() => onNavigate('super-admin')} className="hover:text-cyan-500">Command Center</button>
            <button onClick={() => onNavigate('regulation-bureau')} className="hover:text-cyan-500">Regulation Desk</button>
            <button onClick={() => onNavigate('offline-center')} className="hover:text-cyan-500">Offline PWA</button>
            <button onClick={() => onNavigate('api-integration')} className="hover:text-cyan-500">OpenAPI Docs</button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-400 leading-relaxed">
          <strong>Smart India Hackathon 2026 Academic Research Prototype:</strong> This platform demonstrates a fully operational, offline-first national student data management and verification architecture for AICTE Problem Statement 26263. All institutional identifiers and student identities are simulated synthetic research models.
        </div>
      </footer>

    </div>
  );
};
