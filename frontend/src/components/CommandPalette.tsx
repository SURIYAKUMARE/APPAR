import React, { useState, useEffect } from 'react';
import { 
  Search, Command, ArrowRight, LayoutDashboard, Building2, 
  Users, UserCheck, CopyX, FileCheck2, WifiOff, ScrollText, 
  ShieldAlert, Settings, X, Sparkles, Cpu, TrendingUp 
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const COMMAND_ITEMS = [
  { id: 'ai-command-center', category: 'Autonomous AI', label: 'AI Command OS (Voice & Speech Recognition Terminal)', icon: Sparkles },
  { id: 'multi-agent', category: 'Autonomous AI', label: '15-Agent Intelligence Mesh (Continuous Telemetry & Triage)', icon: Cpu },
  { id: 'workflow-builder', category: 'Autonomous AI', label: 'Visual Workflow Builder (Autonomous Regulatory Pipelines)', icon: Sparkles },
  { id: 'identity-graph', category: 'Autonomous AI', label: 'National Academic Identity Graph (Collision & Linkage Map)', icon: Sparkles },
  { id: 'digital-twin', category: 'Simulation', label: 'Academic Digital Twin (What-If Enrolment & Capacity Simulator)', icon: Building2 },
  { id: 'policy-simulator', category: 'Simulation', label: 'National Policy Simulator (Macro Seat & Budget Sandbox)', icon: TrendingUp },
  { id: 'predictive-ai', category: 'Simulation', label: 'Predictive AI Engine (2026-2030 Admission Trends & Risk Score)', icon: TrendingUp },
  { id: 'document-intelligence', category: 'Intelligence', label: 'Document OCR Studio (AI Table & Sanction PDF Extraction)', icon: FileCheck2 },
  { id: 'regulatory-cases', category: 'Governance', label: 'Regulatory Investigation Desk (Forensic Inquiries & Show-Cause)', icon: FileCheck2 },
  { id: 'operations-center', category: 'DevOps', label: 'Future Operations & DevOps Center (Cluster Health & Heartbeat)', icon: ShieldAlert },
  { id: 'employer-portal', category: 'Verification', label: 'Employer Credential Verification (Authorized DPDP BGV Portal)', icon: UserCheck },
  { id: 'super-admin', category: 'Portals', label: 'Super Admin HQ (AICTE National Overview)', icon: LayoutDashboard },
  { id: 'regulation-bureau', category: 'Portals', label: 'Regulation Bureau Compliance Desk', icon: FileCheck2 },
  { id: 'institution-dashboard', category: 'Portals', label: 'Institution Portal (DITAR New Delhi)', icon: Building2 },
  { id: 'student-dashboard', category: 'Portals', label: 'Student Digital Identity & Consent Desk', icon: Users },
  { id: 'student-registration', category: 'Operations', label: 'Enroll Individual Student with APAAR ID', icon: UserCheck },
  { id: 'bulk-upload', category: 'Operations', label: 'Bulk CSV / Excel Student File Ingestion', icon: Building2 },
  { id: 'apaar-verify', category: 'Operations', label: 'APAAR Checksum & DigiLocker Gateway Verification', icon: UserCheck },
  { id: 'duplicate-detection', category: 'Intelligence', label: 'Cross-Institution Duplicate Detection Engine', icon: CopyX },
  { id: 'admission-compliance', category: 'Intelligence', label: 'Intake Capacity & Supernumerary Quota Audit', icon: FileCheck2 },
  { id: 'offline-center', category: 'PWA', label: 'Offline Center & IndexedDB Sync Queue', icon: WifiOff },
  { id: 'audit-log', category: 'Security', label: 'Immutable SHA-256 Chained Audit Ledger', icon: ScrollText },
  { id: 'security-monitoring', category: 'Security', label: 'Security Operations & Telemetry Center', icon: ShieldAlert },
  { id: 'settings', category: 'Configuration', label: 'Settings & TOTP Authenticator Keys', icon: Settings }
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, page, or regulatory action (or 'Esc' to exit)..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No matching regulatory commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-500/10 text-slate-500 group-hover:text-cyan-500 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↵</kbd>
          </div>
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">AICTE SIH 2026</span>
        </div>

      </div>
    </div>
  );
};
