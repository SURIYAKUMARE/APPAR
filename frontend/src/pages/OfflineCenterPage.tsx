import React, { useState } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, Database, CheckCircle2, 
  AlertTriangle, ArrowRight, Zap, ShieldCheck, Trash2, Clock 
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { useAuth } from '../context/AuthContext';
import { offlineStorage } from '../utils/indexedDB';

interface OfflineCenterPageProps {
  onNavigate: (page: string) => void;
}

export const OfflineCenterPage: React.FC<OfflineCenterPageProps> = ({ onNavigate }) => {
  const { 
    effectiveOnline, isOnline, isSimulatedOffline, toggleSimulatedOffline, 
    pendingCount, queuedRecords, triggerSync, isSyncing, lastSyncTime, 
    syncHistory, refreshQueue 
  } = useOffline();

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleManualSync = async () => {
    setSyncMessage(null);
    setSyncError(null);
    try {
      const res = await triggerSync();
      setSyncMessage(`Synchronization completed: ${res.committed} record(s) committed to Central Registry. ${res.message}`);
    } catch (err: any) {
      setSyncError(err.message || 'Synchronization failed.');
    }
  };

  const handlePurgeLocal = async () => {
    if (window.confirm('Purge local IndexedDB storage cache? Any unsynced changes will be discarded.')) {
      setClearing(true);
      await offlineStorage.purgeAllData();
      await refreshQueue();
      setClearing(false);
      setSyncMessage('Local encrypted IndexedDB cache purged successfully.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Offline-First PWA Synchronization Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Service Workers • Local Encrypted IndexedDB • Conflict Resolution Engine • Guaranteed Field Availability.
          </p>
        </div>

        {/* Network Simulation Toggle */}
        <button
          onClick={toggleSimulatedOffline}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 shadow-sm ${
            effectiveOnline
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20 animate-pulse'
          }`}
        >
          {effectiveOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Simulate Internet Disconnect</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Reconnect Internet (Online)</span>
            </>
          )}
        </button>
      </div>

      {/* Connection Status Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        effectiveOnline
          ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/30 text-emerald-100'
          : 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/30 text-rose-100'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${effectiveOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              {effectiveOnline ? 'Sovereign Gateway Connected' : 'Operating in Secure Offline Mode'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {effectiveOnline
              ? 'Central Centralized AICTE Depository Active'
              : 'IndexedDB Encrypted Local Storage Active'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            {effectiveOnline
              ? 'Student admissions, APAAR verifications, and duplicate queries synchronize in real-time with the national educational cloud.'
              : 'You can continue registering students, reviewing local records, and running offline checks. Records will be cryptographically queued for synchronization.'}
          </p>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
            <div className="text-[10px] text-slate-300 uppercase font-semibold">Pending Queue</div>
            <div className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</div>
            <div className="text-[10px] text-slate-400">Records locally staged</div>
          </div>
        </div>
      </div>

      {/* Sync Status Notifications */}
      {syncMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{syncMessage}</span>
        </div>
      )}

      {syncError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Synchronization Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sync Trigger Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Batch Sync Dispatch
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Push queued local records to Central Depository and run server-side conflict detection.
          </p>
          <div className="text-xs font-mono text-slate-400">
            Last Synced: {lastSyncTime || 'Never'}
          </div>
          <button
            onClick={handleManualSync}
            disabled={!effectiveOnline || isSyncing || pendingCount === 0}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Queue...' : `Push ${pendingCount} Queued Record(s)`}</span>
          </button>
        </div>

        {/* Local Storage Metrics Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-amber-500">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Encrypted IndexedDB Store
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Client-side database engine providing zero data loss during network disruptions.
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Object Store:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">APAAR_ONE_OFFLINE_DB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Usage:</span>
              <span className="font-mono text-cyan-500 font-bold">{(pendingCount * 1.2 + 42).toFixed(1)} KB / 50 MB</span>
            </div>
          </div>
          <button
            onClick={handlePurgeLocal}
            disabled={clearing}
            className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Local Storage</span>
          </button>
        </div>

        {/* Quick Offline Enrolment Shortcut */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Offline Workflow Test
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step 1: Click "Simulate Internet Disconnect".<br />
            Step 2: Register a student.<br />
            Step 3: Reconnect and synchronize!
          </p>
          <button
            onClick={() => onNavigate('student-registration')}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Open Registration Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Currently Queued Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pending Offline Synchronization Queue ({queuedRecords.length})
            </h3>
            <p className="text-xs text-slate-500">Staged in IndexedDB awaiting gateway transmission</p>
          </div>
        </div>

        {queuedRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
            <div>Offline sync queue is currently empty. All student records are synchronized with central registry.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Local Temp ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll ID</th>
                  <th className="py-3 px-3">APAAR ID</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-center">Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queuedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {r.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.full_name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {r.student_id}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {r.apaar_id}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {r.course}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(r.client_timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        PENDING SYNC
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sync Job History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Past Synchronization Batches
          </h3>
          <p className="text-xs text-slate-500">Audit logs of completed client-to-server synchronizations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Batch Reference</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3 text-center">Received</th>
                <th className="py-3 px-3 text-center">Committed</th>
                <th className="py-3 px-3 text-center">Conflicts</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {syncHistory.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {j.batch_reference}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400">
                    {j.institution_id}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {j.records_received}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-500">
                    {j.records_committed}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {j.conflicts_detected}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {j.status}
                    </span>
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
