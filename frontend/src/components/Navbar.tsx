import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';
import { UserRole } from '../types';
import { 
  Sun, Moon, Wifi, WifiOff, RefreshCw, User as UserIcon, 
  LogOut, Shield, ChevronDown, Search, Command, Sparkles 
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

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { effectiveOnline, isSimulatedOffline, toggleSimulatedOffline, pendingCount, triggerSync, isSyncing } = useOffline();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        {/* National Flag Tricolor Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Portal Branding */}
            <div 
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 p-1 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="APAAR ONE Emblem" className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">
                    APAAR<span className="text-cyan-400">ONE</span>
                    <span className="ml-1 px-1.5 py-0.5 text-[11px] font-black bg-cyan-500 text-slate-950 rounded shadow-[0_0_10px_rgba(0,242,254,0.5)]">X</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700">
                    AICTE OS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate max-w-[240px] sm:max-w-none">
                  National Academic Intelligence & Verification Ecosystem
                </p>
              </div>
            </div>

            {/* AI Command OS Quick Launch Pill */}
            <button
              onClick={() => onNavigate('ai-command-center')}
              className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentPage === 'ai-command-center'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Command OS</span>
            </button>

            {/* Quick Command Palette Trigger (Ctrl + K) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:border-cyan-500 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search platform...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Center / Right Control Panel */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Offline / Online Status Pill with Toggle */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleSimulatedOffline}
                  title="Click to simulate offline network disconnect"
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    effectiveOnline
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20 animate-pulse'
                  }`}
                >
                  {effectiveOnline ? (
                    <>
                      <Wifi className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5" />
                      <span>{isSimulatedOffline ? 'Simulated Offline' : 'Offline'}</span>
                    </>
                  )}
                </button>

                {/* Sync Button if pending records */}
                {pendingCount > 0 && (
                  <button
                    onClick={() => triggerSync()}
                    disabled={!effectiveOnline || isSyncing}
                    className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-sm"
                    title="Synchronize offline pending records"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{pendingCount} Pending</span>
                  </button>
                )}
              </div>

              {/* Quick Role Switcher for SIH Jury Evaluation */}
              <div className="relative group">
                <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden lg:inline font-semibold">Role:</span>
                  <span className="truncate max-w-[90px] sm:max-w-none">{role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>

                {/* Role Dropdown */}
                <div className="absolute right-0 mt-1 w-64 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/50 mb-1">
                    Switch Active Role (Demo)
                  </div>
                  {ROLES_LIST.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchDemoRole(item.role);
                        if (item.role === 'SUPER_ADMIN') onNavigate('super-admin');
                        else if (item.role === 'REGULATION_OFFICER') onNavigate('regulation-bureau');
                        else if (item.role === 'INSTITUTION_ADMIN') onNavigate('institution-dashboard');
                        else if (item.role === 'STUDENT') onNavigate('student-dashboard');
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/60 ${
                        role === item.role ? 'font-bold text-cyan-500 bg-cyan-500/10' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      {role === item.role && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Center Bell */}
              <NotificationCenter onNavigate={onNavigate} />

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Profile / Logout */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div 
                  onClick={() => onNavigate('settings')}
                  className="hidden xl:flex flex-col text-right cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user?.full_name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-slate-400">{user?.email || 'aicte.gov.in'}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Secure Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
