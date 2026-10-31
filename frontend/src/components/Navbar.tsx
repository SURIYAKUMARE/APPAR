import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';
import { UserRole } from '../types';
import { 
  Sun, Moon, Wifi, WifiOff, RefreshCw, User as UserIcon, 
  LogOut, Shield, ChevronDown, Search, Command, Sparkles,
  ChevronRight, Building, Plus, HelpCircle, FileText, CheckCircle2,
  ExternalLink, Bell
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const ROLES_LIST: { role: UserRole; label: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin (AICTE HQ)' },
  { role: 'REGULATION_OFFICER', label: 'Regulation Bureau Officer' },
  { role: 'STATE_NODAL_OFFICER', label: 'State Nodal Officer' },
  { role: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
  { role: 'ADMISSION_OFFICER', label: 'Admission Verification Officer' },
  { role: 'STUDENT', label: 'Student' },
  { role: 'EXTERNAL_VERIFIER', label: 'Employer / Verifier' },
  { role: 'AUDITOR', label: 'Auditor (CAG / Regulatory)' }
];

const INSTITUTION_OPTIONS = [
  { id: 'ALL', name: 'All AICTE Institutions (National View)' },
  { id: 'INST-101', name: 'Delhi Institute of Technology & Research (INST-101)' },
  { id: 'INST-102', name: 'IIT Madras Technology Campus (INST-102)' },
  { id: 'INST-103', name: 'Mumbai National College of Engineering (INST-103)' },
  { id: 'INST-104', name: 'Bengaluru Institute of Artificial Intelligence (INST-104)' },
  { id: 'INST-105', name: 'Anna University School of Technology (INST-105)' }
];

// Helper to construct dynamic breadcrumbs
const getBreadcrumb = (page: string): { section: string; title: string } => {
  switch (page) {
    case 'super-admin':
      return { section: 'Executive', title: 'National Overview' };
    case 'students-directory':
      return { section: 'Student Management', title: 'All Students Directory' };
    case 'student-registration':
      return { section: 'Student Management', title: 'New Student Registration' };
    case 'apaar-verify':
      return { section: 'Student Management', title: 'APAAR ID Verification' };
    case 'duplicate-detection':
      return { section: 'AI Intelligence', title: 'Duplicate Student Detection' };
    case 'bulk-upload':
      return { section: 'Data Management', title: 'Bulk Data Import' };
    case 'institution-management':
      return { section: 'Institution Management', title: 'Institution Directory' };
    case 'institution-dashboard':
      return { section: 'Institution Management', title: 'Institution Profile' };
    case 'admission-compliance':
      return { section: 'Institution Management', title: 'Admission & Intake Compliance' };
    case 'employer-portal':
      return { section: 'Institution Management', title: 'Employer Verification Desk' };
    case 'offline-center':
      return { section: 'Data Management', title: 'Offline Operations & Cache' };
    case 'operations-center':
      return { section: 'Data Management', title: 'Data Quality & Operations' };
    case 'ai-command-center':
      return { section: 'AI Intelligence', title: 'AI Command OS' };
    case 'multi-agent':
      return { section: 'AI Intelligence', title: '15-Agent Intelligence Mesh' };
    case 'predictive-ai':
      return { section: 'AI Intelligence', title: 'Predictive Analytics' };
    case 'identity-graph':
      return { section: 'AI Intelligence', title: 'Academic Identity Graph' };
    case 'policy-simulator':
      return { section: 'AI Intelligence', title: 'National Policy Sandbox' };
    case 'document-intelligence':
      return { section: 'AI Intelligence', title: 'Document OCR Studio' };
    case 'digital-twin':
      return { section: 'AI Intelligence', title: 'Academic Digital Twin' };
    case 'analytics-reports':
      return { section: 'Reports & Analytics', title: 'National Statistics & Reports' };
    case 'regulatory-cases':
      return { section: 'Reports & Analytics', title: 'Regulatory Investigation Cases' };
    case 'workflow-builder':
      return { section: 'Workflow Management', title: 'Visual Workflow Builder' };
    case 'audit-log':
      return { section: 'Audit & Compliance', title: 'Immutable Audit Ledger' };
    case 'security-monitoring':
      return { section: 'Audit & Compliance', title: 'Security & Telemetry' };
    case 'privacy-command-center':
      return { section: 'Audit & Compliance', title: 'DPDP Privacy Desk' };
    case 'api-integration':
      return { section: 'Audit & Compliance', title: 'OpenAPI & Adapters' };
    case 'settings':
      return { section: 'Settings', title: 'Profile & Security' };
    case 'student-dashboard':
      return { section: 'Student Portal', title: 'Student DigiLocker' };
    default:
      return { section: 'Platform', title: 'Dashboard' };
  }
};

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { effectiveOnline, isSimulatedOffline, toggleSimulatedOffline, pendingCount, triggerSync, isSyncing } = useOffline();
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('ALL');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const breadcrumb = useMemo(() => getBreadcrumb(currentPage), [currentPage]);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101B36]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E2D52] shadow-xs">
        {/* Official AICTE / National Tricolor Top Stripe */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#128807]" />

        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Branding & Breadcrumbs */}
            <div className="flex items-center gap-4">
              {/* Brand Logo */}
              <div 
                onClick={() => onNavigate('super-admin')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Go to National Overview"
              >
                <div className="w-9 h-9 rounded-xl bg-[#101B36] dark:bg-[#2457E8] p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <img src="/logo.svg" alt="APAAR ONE Emblem" className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                      APAAR<span className="text-[#2457E8] dark:text-[#16C8D8]">ONE</span>
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/50 text-[#2457E8] dark:text-cyan-300 rounded border border-blue-200 dark:border-blue-700">
                      AICTE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block leading-tight">
                    National Student Data Platform
                  </p>
                </div>
              </div>

              {/* Dynamic Breadcrumbs */}
              <div className="hidden md:flex items-center text-xs text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('super-admin')}>
                  Home
                </span>
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {breadcrumb.section}
                </span>
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {breadcrumb.title}
                </span>
              </div>
            </div>

            {/* Center: Global Search Bar + Ctrl+K */}
            <div className="flex-1 max-w-md mx-2 hidden lg:block">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-200/90 dark:border-[#1E2D52] text-xs text-slate-500 hover:border-[#2457E8] dark:hover:border-[#16C8D8] transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2457E8]" />
                  <span>Search students, APAAR IDs, institutions, or actions...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#101B36] border border-slate-200 dark:border-[#1E2D52] text-slate-400 shadow-2xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right: Actions, Context Selectors & Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Institution Switcher Dropdown */}
              <div className="relative hidden xl:block">
                <button
                  onClick={() => setShowInstitutionDropdown(!showInstitutionDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0A1124] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D52] hover:border-slate-300 transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span className="max-w-[140px] truncate text-[11px]">
                    {INSTITUTION_OPTIONS.find(i => i.id === selectedInstitution)?.name || 'Select Institution'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showInstitutionDropdown && (
                  <div className="absolute right-0 mt-1 w-80 py-1.5 bg-white dark:bg-[#101B36] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E2D52] z-50">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      Institution Viewing Scope
                    </div>
                    {INSTITUTION_OPTIONS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          setSelectedInstitution(inst.id);
                          setShowInstitutionDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          selectedInstitution === inst.id
                            ? 'font-semibold text-[#2457E8] dark:text-[#16C8D8] bg-blue-50/50 dark:bg-blue-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{inst.name}</span>
                        {selectedInstitution === inst.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8] shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Button */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('apaar-verify')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2457E8] hover:bg-blue-700 text-white shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verify APAAR</span>
                </button>
                <button
                  onClick={() => onNavigate('student-registration')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#0A1124] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1E2D52] transition-colors"
                  title="Register Student"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Add Student</span>
                </button>
              </div>

              {/* Offline / Online Network Pill */}
              <button
                onClick={toggleSimulatedOffline}
                title="Click to toggle simulated offline network mode"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  effectiveOnline
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-500 text-white border-rose-600 animate-pulse'
                }`}
              >
                {effectiveOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden sm:inline text-[11px]">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span className="text-[11px]">{isSimulatedOffline ? 'Sim Offline' : 'Offline'}</span>
                  </>
                )}
              </button>

              {/* Pending Offline Sync Badge Button */}
              {pendingCount > 0 && (
                <button
                  onClick={() => triggerSync()}
                  disabled={!effectiveOnline || isSyncing}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5A623] text-slate-900 hover:bg-amber-400 transition-colors shadow-2xs"
                  title="Synchronize offline cached records"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-bold">{pendingCount} Sync</span>
                </button>
              )}

              {/* Role Switcher (For SIH Demonstration & Evaluation) */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1124] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D52] hover:border-blue-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#2457E8] dark:text-[#16C8D8]" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-500">Role:</span>
                  <span className="text-[11px] font-semibold max-w-[80px] sm:max-w-[110px] truncate">{role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-1 w-64 py-2 bg-white dark:bg-[#101B36] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E2D52] z-50">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                      Role Emulation (SIH Jury Mode)
                    </div>
                    {ROLES_LIST.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchDemoRole(item.role);
                          setShowRoleDropdown(false);
                          if (item.role === 'SUPER_ADMIN') onNavigate('super-admin');
                          else if (item.role === 'REGULATION_OFFICER') onNavigate('regulatory-cases');
                          else if (item.role === 'INSTITUTION_ADMIN') onNavigate('institution-dashboard');
                          else if (item.role === 'STUDENT') onNavigate('student-dashboard');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          role === item.role
                            ? 'font-bold text-[#2457E8] dark:text-[#16C8D8] bg-blue-50/60 dark:bg-blue-950/40'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{item.label}</span>
                        {role === item.role && <div className="w-1.5 h-1.5 rounded-full bg-[#2457E8]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Center Bell */}
              <NotificationCenter onNavigate={onNavigate} />

              {/* Help & Documentation Modal Trigger */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Documentation & Guidance"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Dark / Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#0A1124] text-slate-600 dark:text-slate-300 hover:text-[#2457E8] dark:hover:text-[#16C8D8] border border-slate-200 dark:border-[#1E2D52] transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* User Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2457E8] to-[#16C8D8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(user?.full_name || 'AICTE')[0]}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user?.full_name || 'Administrator'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {user?.institution_id || 'AICTE HQ'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-1 w-56 py-1.5 bg-white dark:bg-[#101B36] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E2D52] z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {user?.full_name || 'Administrator'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {user?.email || 'admin@aicte-india.org'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Security Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('audit-log');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Audit Trail</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#101B36] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E2D52] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#2457E8] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  APAAR ONE Platform Documentation
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>AICTE SIH 2026 Problem Statement 26263:</strong> APAAR ID-based Student Data Management and Verification Platform for Technical Institutions.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1124] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Key Architectural Pillars:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li><strong>APAAR Verhoeff Checksum:</strong> Real-time 12-digit mathematical validation.</li>
                  <li><strong>Cross-Institution Duplicate Detection:</strong> Real-time multi-college anomaly isolation.</li>
                  <li><strong>Autonomous AI Agents:</strong> 15 specialized agents orchestrating continuous verification.</li>
                  <li><strong>Offline-First Resilience:</strong> IndexedDB queuing with SHA-256 conflict resolution.</li>
                  <li><strong>Tamper-Evident Ledger:</strong> Cryptographic audit logging with SHA-256 hash chains.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2457E8] text-white hover:bg-blue-700 transition-colors"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
