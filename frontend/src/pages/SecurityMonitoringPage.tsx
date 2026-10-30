import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Lock, 
  RefreshCw, CheckCircle2, UserX, Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SecurityEvent } from '../types';

interface SecurityMonitoringPageProps {
  onNavigate: (page: string) => void;
}

export const SecurityMonitoringPage: React.FC<SecurityMonitoringPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit/security-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const handleResolveEvent = async (id: number) => {
    try {
      await fetch(`/api/audit/security-events/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-Time Security & Telemetry Defense Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Defense-in-Depth Monitoring • Rate Limit Enforcement • Intrusion Detection • Account Lockout Control.
          </p>
        </div>

        <button
          onClick={fetchSecurityEvents}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Security Posture Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MFA Protocol</span>
          <div className="text-lg font-bold text-emerald-500 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Enforced (TOTP/SMS)</span>
          </div>
          <p className="text-[10px] text-slate-500">2FA required for administrative roles</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Lockout</span>
          <div className="text-lg font-bold text-cyan-500 font-mono">5 Attempts / 15m</div>
          <p className="text-[10px] text-slate-500">Brute-force mitigation active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hash Engine</span>
          <div className="text-lg font-bold text-purple-500 font-mono">PBKDF2-HMAC-256</div>
          <p className="text-[10px] text-slate-500">100,000 salt iterations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transport Layer</span>
          <div className="text-lg font-bold text-emerald-500 font-mono">TLS 1.3 Strict</div>
          <p className="text-[10px] text-slate-500">AES-256-GCM cipher suite</p>
        </div>
      </div>

      {/* Security Incident Stream Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Security Telemetry Events ({events.length})
          </h2>
          <p className="text-xs text-slate-500">Automated alerts logged by authentication middleware</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-3">Actor / Target</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-4">Event Telemetry</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                    {evt.event_type}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {evt.actor || 'ANONYMOUS'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {evt.ip_address}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {evt.details}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      evt.resolved
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {evt.resolved ? 'RESOLVED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {!evt.resolved && (
                      <button
                        onClick={() => handleResolveEvent(evt.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
