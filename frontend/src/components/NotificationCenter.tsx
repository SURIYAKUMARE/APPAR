import React, { useState } from 'react';
import { Bell, AlertTriangle, CopyX, CheckCircle2, ShieldCheck, X, ChevronRight } from 'lucide-react';

interface NotificationCenterProps {
  onNavigate: (page: string) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'breach' | 'duplicate' | 'security' | 'sync';
  pageTarget: string;
  unread: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Statutory Intake Breach Flagged',
      desc: 'INST-AICTE-107 (UP Tech) exceeded CSE ceiling by 12 students (+10%).',
      time: '12m ago',
      type: 'breach',
      pageTarget: 'admission-compliance',
      unread: true
    },
    {
      id: '2',
      title: 'Cross-Institution Duplicate Collision',
      desc: 'APAAR 982345108742 registered simultaneously at DITAR & National College.',
      time: '34m ago',
      type: 'duplicate',
      pageTarget: 'duplicate-detection',
      unread: true
    },
    {
      id: '3',
      title: 'Offline Sync Queue Verified',
      desc: 'Local IndexedDB synchronized successfully with Central Educational Registry.',
      time: '2h ago',
      type: 'sync',
      pageTarget: 'offline-center',
      unread: false
    },
    {
      id: '4',
      title: 'Security Telemetry Alert',
      desc: 'Account lockout mitigation triggered after 5 failed password attempts on unknown IP.',
      time: '4h ago',
      type: 'security',
      pageTarget: 'security-monitoring',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors relative"
        title="National Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onNavigate(n.pageTarget);
                  setIsOpen(false);
                }}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-start space-x-3 ${
                  n.unread ? 'bg-cyan-500/5' : ''
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  n.type === 'breach' ? 'bg-rose-500/10 text-rose-500' :
                  n.type === 'duplicate' ? 'bg-amber-500/10 text-amber-500' :
                  n.type === 'security' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {n.type === 'breach' && <AlertTriangle className="w-4 h-4" />}
                  {n.type === 'duplicate' && <CopyX className="w-4 h-4" />}
                  {n.type === 'security' && <ShieldCheck className="w-4 h-4" />}
                  {n.type === 'sync' && <CheckCircle2 className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {n.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-mono text-slate-400">
              AICTE National Monitoring Feed • Active
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
