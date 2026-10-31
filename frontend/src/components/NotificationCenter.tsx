import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, CopyX, CheckCircle2, ShieldCheck, X, 
  ChevronRight, Sliders, Check, Clock, ShieldAlert, Cpu
} from 'lucide-react';

interface NotificationCenterProps {
  onNavigate: (page: string) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: 'verification' | 'intake' | 'security' | 'system';
  pageTarget: string;
  unread: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'verification' | 'intake' | 'security' | 'preferences'>('all');
  
  // Notification Preferences
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    intakeBreachAlerts: true,
    duplicateDetectionAlerts: true,
    slaReminders: true,
    systemUpdates: false
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Statutory Intake Breach Flagged',
      desc: 'INST-AICTE-107 (UP Tech) exceeded CSE ceiling by 12 students (+10%).',
      time: '12m ago',
      category: 'intake',
      pageTarget: 'admission-compliance',
      unread: true
    },
    {
      id: '2',
      title: 'Cross-Institution Duplicate Collision',
      desc: 'APAAR 982345108742 registered simultaneously at DITAR & National College.',
      time: '34m ago',
      category: 'verification',
      pageTarget: 'duplicate-detection',
      unread: true
    },
    {
      id: '3',
      title: 'Offline Sync Queue Verified',
      desc: 'Local IndexedDB synchronized successfully with Central Educational Registry.',
      time: '2h ago',
      category: 'system',
      pageTarget: 'offline-center',
      unread: false
    },
    {
      id: '4',
      title: 'Security Telemetry Alert',
      desc: 'Account lockout mitigation triggered after 5 failed password attempts on unknown IP.',
      time: '4h ago',
      category: 'security',
      pageTarget: 'security-monitoring',
      unread: false
    },
    {
      id: '5',
      title: 'Verhoeff Checksum Batch Verified',
      desc: '120 student records verified against ABC Registry depository sandbox.',
      time: '5h ago',
      category: 'verification',
      pageTarget: 'apaar-verify',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-[#0A1124] text-slate-600 dark:text-slate-300 hover:text-[#2457E8] dark:hover:text-[#16C8D8] border border-slate-200 dark:border-[#1E2D52] transition-colors relative"
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E34B55] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#101B36] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-50/70 dark:bg-[#0A1124]/70 border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Notification Center
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#E34B55] dark:bg-rose-950/60 border border-rose-200">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-[#2457E8] dark:text-[#16C8D8] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm ml-1"
              >
                ×
              </button>
            </div>
          </div>

          {/* Sub-tabs: All, Verification, Intake, Security, Preferences */}
          <div className="flex items-center gap-1 px-3 border-b border-slate-100 dark:border-[#1E2D52] text-[11px] font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-2 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab('intake')}
              className={`py-2 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'intake'
                  ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Intake
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'preferences'
                  ? 'border-[#2457E8] text-[#2457E8] dark:text-[#16C8D8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Config</span>
            </button>
          </div>

          {/* Contents Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {activeTab === 'preferences' ? (
              <div className="p-4 space-y-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                  Notification Preferences:
                </span>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-300">Intake Limit Breach Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.intakeBreachAlerts}
                    onChange={(e) => setPreferences({ ...preferences, intakeBreachAlerts: e.target.checked })}
                    className="rounded text-[#2457E8] focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-300">Duplicate Student Detection</span>
                  <input
                    type="checkbox"
                    checked={preferences.duplicateDetectionAlerts}
                    onChange={(e) => setPreferences({ ...preferences, duplicateDetectionAlerts: e.target.checked })}
                    className="rounded text-[#2457E8] focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-300">Statutory SLA Reminders</span>
                  <input
                    type="checkbox"
                    checked={preferences.slaReminders}
                    onChange={(e) => setPreferences({ ...preferences, slaReminders: e.target.checked })}
                    className="rounded text-[#2457E8] focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-300">Security Telemetry Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                    className="rounded text-[#2457E8] focus:ring-0"
                  />
                </label>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications in this category
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate(item.pageTarget);
                  }}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors flex items-start gap-3 ${
                    item.unread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {item.category === 'intake' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    {item.category === 'verification' && (
                      <div className="w-2 h-2 rounded-full bg-[#E34B55]" />
                    )}
                    {item.category === 'security' && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                    {item.category === 'system' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={(e) => toggleRead(item.id, e)}
                    className="text-slate-300 hover:text-slate-600 mt-0.5"
                    title={item.unread ? 'Mark as read' : 'Mark as unread'}
                  >
                    <div className={`w-2 h-2 rounded-full ${item.unread ? 'bg-[#2457E8]' : 'bg-transparent border border-slate-300'}`} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-slate-50/70 dark:bg-[#0A1124]/70 border-t border-slate-100 dark:border-[#1E2D52] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('regulatory-cases');
              }}
              className="text-xs font-semibold text-[#2457E8] dark:text-[#16C8D8] hover:underline flex items-center justify-center gap-1"
            >
              <span>View All Regulatory Incidents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
