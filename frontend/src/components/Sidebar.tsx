import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UploadCloud,
  CopyX,
  FileCheck2,
  Building2,
  Scale,
  Brain,
  Cpu,
  TrendingUp,
  Workflow,
  Share2,
  Sliders,
  FileText,
  BarChart3,
  ScrollText,
  ShieldAlert,
  Lock,
  Webhook,
  WifiOff,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Server,
  Layers,
  GraduationCap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavSubItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  defaultPage?: string;
  subItems?: NavSubItem[];
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { role, user } = useAuth();
  const { pendingCount } = useOffline();

  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('apaar_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Search query inside sidebar
  const [searchQuery, setSearchQuery] = useState('');

  // Open groups state for accordions
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    students: true,
    institutions: false,
    'data-management': false,
    'ai-intelligence': false,
    reports: false,
    workflows: false,
    audit: false
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('apaar_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      try {
        localStorage.setItem('apaar_sidebar_collapsed', 'false');
      } catch {}
    }
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Define the 10 core navigation groups as requested by AICTE Master Redesign specification
  const navGroups: NavGroup[] = useMemo(() => [
    {
      id: 'overview',
      title: 'Overview',
      icon: LayoutDashboard,
      defaultPage: 'super-admin',
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'STATE_NODAL_OFFICER', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER', 'STUDENT', 'EXTERNAL_VERIFIER', 'AUDITOR']
    },
    {
      id: 'students',
      title: 'Student Management',
      icon: Users,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER'],
      subItems: [
        { id: 'students-directory', label: 'All Students', icon: Users },
        { id: 'student-registration', label: 'Student Registration', icon: UserPlus },
        { id: 'apaar-verify', label: 'APAAR ID Verification', icon: ShieldCheck },
        { id: 'duplicate-detection', label: 'Duplicate Detection', icon: CopyX, badge: 'AI', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
        { id: 'bulk-upload', label: 'Bulk Student Import', icon: UploadCloud }
      ]
    },
    {
      id: 'institutions',
      title: 'Institution Management',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'INSTITUTION_ADMIN'],
      subItems: [
        { id: 'institution-management', label: 'Institution Directory', icon: Building2 },
        { id: 'institution-dashboard', label: 'Institution Profiles', icon: Layers },
        { id: 'employer-portal', label: 'Verification Desk', icon: ShieldCheck },
        { id: 'admission-compliance', label: 'Affiliation & Intake', icon: FileCheck2 }
      ]
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER'],
      subItems: [
        { id: 'bulk-upload', label: 'Data Import Center', icon: UploadCloud },
        { id: 'admission-compliance', label: 'Validation Engine', icon: FileCheck2 },
        { 
          id: 'offline-center', 
          label: 'Offline Sync & Cache', 
          icon: WifiOff,
          badge: pendingCount > 0 ? `${pendingCount}` : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { id: 'operations-center', label: 'Data Quality & Ops', icon: Server }
      ]
    },
    {
      id: 'ai-intelligence',
      title: 'AI Intelligence Center',
      icon: Brain,
      subItems: [
        { id: 'ai-command-center', label: 'AI Command OS', icon: Sparkles, badge: 'LIVE', badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700' },
        { id: 'multi-agent', label: '15-Agent Mesh', icon: Cpu, badge: 'v2.6', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
        { id: 'predictive-ai', label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'identity-graph', label: 'Identity Graph', icon: Share2 },
        { id: 'policy-simulator', label: 'Policy Sandbox', icon: Sliders },
        { id: 'document-intelligence', label: 'Document OCR Studio', icon: FileText },
        { id: 'digital-twin', label: 'Academic Digital Twin', icon: Brain }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'INSTITUTION_ADMIN', 'AUDITOR'],
      subItems: [
        { id: 'analytics-reports', label: 'National Statistics', icon: BarChart3 },
        { id: 'regulatory-cases', label: 'Investigation Cases', icon: Scale, badge: '3', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' }
      ]
    },
    {
      id: 'workflows',
      title: 'Workflow Management',
      icon: Workflow,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'INSTITUTION_ADMIN'],
      subItems: [
        { id: 'workflow-builder', label: 'Visual Workflow Builder', icon: Workflow },
        { id: 'regulatory-cases', label: 'Pending Approvals Queue', icon: Clock }
      ]
    },
    {
      id: 'audit',
      title: 'Audit & Compliance',
      icon: ScrollText,
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'AUDITOR'],
      subItems: [
        { id: 'audit-log', label: 'Immutable Audit Ledger', icon: ScrollText },
        { id: 'security-monitoring', label: 'Security & Telemetry', icon: ShieldAlert },
        { id: 'privacy-command-center', label: 'DPDP Privacy Desk', icon: Lock },
        { id: 'api-integration', label: 'OpenAPI & Adapters', icon: Webhook }
      ]
    },
    {
      id: 'student-portal',
      title: 'Student Portal',
      icon: GraduationCap,
      defaultPage: 'student-dashboard',
      roles: ['SUPER_ADMIN', 'STUDENT']
    },
    {
      id: 'settings',
      title: 'Settings & Security',
      icon: Settings,
      defaultPage: 'settings',
      roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'STATE_NODAL_OFFICER', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER', 'STUDENT', 'EXTERNAL_VERIFIER', 'AUDITOR']
    }
  ], [pendingCount]);

  // Filter groups and subitems by user role and search query
  const filteredGroups = useMemo(() => {
    return navGroups
      .filter(group => !group.roles || group.roles.includes(role))
      .map(group => {
        if (!group.subItems) {
          const matchesSearch = !searchQuery || group.title.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch ? group : null;
        }

        const filteredSubs = group.subItems.filter(sub => {
          const roleMatch = !sub.roles || sub.roles.includes(role);
          const searchMatch = !searchQuery || 
            sub.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.title.toLowerCase().includes(searchQuery.toLowerCase());
          return roleMatch && searchMatch;
        });

        if (filteredSubs.length > 0) {
          return { ...group, subItems: filteredSubs };
        }
        return null;
      })
      .filter(Boolean) as NavGroup[];
  }, [navGroups, role, searchQuery]);

  // Keep active item's group expanded
  useEffect(() => {
    for (const group of navGroups) {
      if (group.subItems?.some(s => s.id === currentPage)) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
        break;
      }
    }
  }, [currentPage, navGroups]);

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-[#101B36] border-r border-slate-200/90 dark:border-[#1E2D52] transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Sidebar Header & Toggle */}
      <div className="p-3 border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation
            </span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
            isCollapsed ? 'mx-auto' : 'ml-auto'
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* In-Sidebar Search (When Expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter menu..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0A1124] border border-slate-200 dark:border-[#1E2D52] rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Nav Items List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
        {filteredGroups.map((group) => {
          const GroupIcon = group.icon;
          const hasSubs = !!group.subItems && group.subItems.length > 0;
          const isGroupOpen = openGroups[group.id] || !!searchQuery;
          const isGroupActive = hasSubs
            ? group.subItems?.some(s => s.id === currentPage)
            : group.defaultPage === currentPage;

          // Collapsed Mode: Icon Button with Native Tooltip
          if (isCollapsed) {
            return (
              <div key={group.id} className="relative group/tooltip flex justify-center py-1">
                <button
                  onClick={() => {
                    if (hasSubs && group.subItems && group.subItems.length > 0) {
                      onNavigate(group.subItems[0].id);
                    } else if (group.defaultPage) {
                      onNavigate(group.defaultPage);
                    }
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isGroupActive
                      ? 'bg-[#2457E8] text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={group.title}
                >
                  <GroupIcon className="w-5 h-5 shrink-0" />
                  {group.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-[#101B36]" />
                  )}
                </button>
                {/* Floating Tooltip */}
                <div className="absolute left-[72px] top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {group.title}
                </div>
              </div>
            );
          }

          // Expanded Mode: Accordion or Direct Link
          if (!hasSubs) {
            return (
              <button
                key={group.id}
                onClick={() => group.defaultPage && onNavigate(group.defaultPage)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isGroupActive
                    ? 'bg-[#2457E8] text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{group.title}</span>
                </div>
                {group.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${group.badgeColor || 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'}`}>
                    {group.badge}
                  </span>
                )}
              </button>
            );
          }

          // Group With Submenu Accordion
          return (
            <div key={group.id} className="pt-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isGroupActive
                    ? 'text-[#2457E8] dark:text-cyan-400 bg-blue-50/70 dark:bg-blue-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-[#2457E8] dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{group.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {group.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${group.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      {group.badge}
                    </span>
                  )}
                  {isGroupOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Subitems container */}
              {isGroupOpen && (
                <div className="mt-1 ml-4 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                  {group.subItems?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = currentPage === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isSubActive
                            ? 'bg-[#2457E8] text-white font-medium shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {SubIcon && (
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {sub.badge && (
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${sub.badgeColor || 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer with Role Indicator and Version */}
      <div className="p-3 border-t border-slate-100 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1124]/50">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Current Role
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-[#101B36] border border-slate-200 dark:border-[#1E2D52]">
              <ShieldCheck className="w-4 h-4 text-[#2457E8] dark:text-cyan-400 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {role.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.institution_id || 'AICTE National Bureau'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>APAAR ONE Enterprise</span>
              <span className="font-mono">v2.6.3</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`${role.replace(/_/g, ' ')} (${user?.institution_id || 'AICTE HQ'})`}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#2457E8] dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
