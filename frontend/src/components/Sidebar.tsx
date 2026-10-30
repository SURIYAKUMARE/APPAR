import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  UploadCloud,
  CopyX,
  FileCheck2,
  BarChart3,
  ScrollText,
  ShieldAlert,
  Webhook,
  WifiOff,
  Settings,
  GraduationCap,
  Scale,
  KeyRound,
  Lock,
  Sparkles,
  Cpu,
  TrendingUp,
  Brain,
  Workflow,
  Share2,
  Sliders,
  FileText,
  Server
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { role } = useAuth();
  const { pendingCount } = useOffline();

  const sections: NavSection[] = [
    {
      title: 'Portals & Dashboards',
      items: [
        { id: 'landing', label: 'National Portal (Home)', icon: Home },
        { id: 'super-admin', label: 'Super Admin HQ', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
        { id: 'regulation-bureau', label: 'Regulation Bureau', icon: Scale, roles: ['SUPER_ADMIN', 'REGULATION_OFFICER'] },
        { id: 'institution-dashboard', label: 'Institution Portal', icon: Building2, roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER'] },
        { id: 'student-dashboard', label: 'Student Digilocker', icon: GraduationCap, roles: ['SUPER_ADMIN', 'STUDENT'] },
        { id: 'employer-portal', label: 'Employer Verification', icon: UserCheck, roles: ['SUPER_ADMIN', 'EXTERNAL_VERIFIER'], badge: 'BGV' }
      ]
    },
    {
      title: 'AI & Autonomous Intelligence',
      items: [
        { id: 'ai-command-center', label: 'AI Command OS', icon: Sparkles, badge: 'VOICE', badgeColor: 'bg-cyan-500 text-slate-950 font-bold' },
        { id: 'multi-agent', label: '15-Agent Intelligence Mesh', icon: Cpu, badge: '15 AGENTS', badgeColor: 'bg-violet-500 text-white font-bold' },
        { id: 'workflow-builder', label: 'Visual Workflow Builder', icon: Workflow, badge: 'AUTONOMOUS', badgeColor: 'bg-cyan-500 text-slate-950 font-bold' },
        { id: 'identity-graph', label: 'Academic Identity Graph', icon: Share2, badge: 'GRAPH' },
        { id: 'digital-twin', label: 'Academic Digital Twin', icon: Brain, badge: 'SIMULATOR', badgeColor: 'bg-blue-500 text-white' },
        { id: 'policy-simulator', label: 'National Policy Sandbox', icon: Sliders, badge: 'MACRO' },
        { id: 'predictive-ai', label: 'Predictive AI Engine', icon: TrendingUp, badge: '2030', badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
        { id: 'document-intelligence', label: 'Document OCR Studio', icon: FileText, badge: 'OCR' }
      ]
    },
    {
      title: 'Student & APAAR Operations',
      items: [
        { id: 'student-registration', label: 'Student Registration', icon: UserPlus, roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER'] },
        { id: 'bulk-upload', label: 'Bulk CSV/Excel Upload', icon: UploadCloud, roles: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER'] },
        { id: 'apaar-verify', label: 'APAAR Verification Gateway', icon: UserCheck },
        { id: 'duplicate-detection', label: 'Duplicate Detection Engine', icon: CopyX, badge: 'AI Filter' },
        { id: 'admission-compliance', label: 'Admission Compliance', icon: FileCheck2 }
      ]
    },
    {
      title: 'Governance & Analytics',
      items: [
        { id: 'institution-management', label: 'Institutions Directory', icon: Building2 },
        { id: 'regulatory-cases', label: 'Regulatory Investigation Desk', icon: Scale, roles: ['SUPER_ADMIN', 'REGULATION_OFFICER'], badge: '3 CASES', badgeColor: 'bg-red-500 text-white' },
        { id: 'analytics-reports', label: 'National Analytics & Reports', icon: BarChart3 },
        { id: 'operations-center', label: 'Operations & DevOps', icon: Server, roles: ['SUPER_ADMIN', 'AUDITOR'], badge: 'HEALTH' },
        { 
          id: 'offline-center', 
          label: 'Offline Center', 
          icon: WifiOff, 
          badge: pendingCount > 0 ? `${pendingCount}` : undefined,
          badgeColor: 'bg-amber-500 text-slate-900'
        },
        { id: 'audit-log', label: 'Immutable Audit Ledger', icon: ScrollText, roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'AUDITOR'] },
        { id: 'security-monitoring', label: 'Security & Telemetry', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'REGULATION_OFFICER', 'AUDITOR'] },
        { id: 'privacy-command-center', label: 'Privacy & DPDP Desk', icon: Lock },
        { id: 'api-integration', label: 'OpenAPI & Adapters', icon: Webhook }
      ]
    },
    {
      title: 'Account & Credentials',
      items: [
        { id: 'login', label: 'Enterprise Login', icon: KeyRound },
        { id: 'settings', label: 'Settings & Security', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0a192f] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {sections.map((sec, idx) => {
          // Filter items by role
          const visibleItems = sec.items.filter((item) => {
            if (!item.roles) return true;
            return item.roles.includes(role);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {sec.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            item.badgeColor || 'bg-cyan-500/20 text-cyan-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">APAAR ONE v2.6.3</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-tight text-slate-400">
          AICTE Regulation Bureau • SIH 2026
        </p>
      </div>
    </aside>
  );
};
