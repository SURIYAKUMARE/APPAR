import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineStorage } from '../utils/indexedDB';
import { OfflineQueuedRecord, SyncHistoryItem } from '../types';
import { useAuth } from './AuthContext';

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  pendingCount: number;
  queuedRecords: OfflineQueuedRecord[];
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncHistory: SyncHistoryItem[];
  toggleSimulatedOffline: () => void;
  refreshQueue: () => Promise<void>;
  triggerSync: () => Promise<{ committed: number; conflicts: number; message: string }>;
  queueStudentOffline: (record: Omit<OfflineQueuedRecord, 'id' | 'status' | 'client_timestamp'>) => Promise<string>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [queuedRecords, setQueuedRecords] = useState<OfflineQueuedRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('last_sync_time'));
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const refreshQueue = async () => {
    try {
      const records = await offlineStorage.getQueuedRecords();
      setQueuedRecords(records);
    } catch (e) {
      console.error('Failed to load queued records:', e);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch sync history from server if online
  useEffect(() => {
    if (effectiveOnline && token) {
      fetch('/api/sync/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setSyncHistory(data))
        .catch(() => {});
    }
  }, [effectiveOnline, token]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const queueStudentOffline = async (data: Omit<OfflineQueuedRecord, 'id' | 'status' | 'client_timestamp'>): Promise<string> => {
    const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: OfflineQueuedRecord = {
      ...data,
      id,
      client_timestamp: new Date().toISOString(),
      status: 'PENDING_SYNC'
    };
    await offlineStorage.queueRecord(newRecord);
    await refreshQueue();
    return id;
  };

  const triggerSync = async (): Promise<{ committed: number; conflicts: number; message: string }> => {
    if (!effectiveOnline) {
      throw new Error('Cannot synchronize while offline. Please reconnect first.');
    }

    setIsSyncing(true);
    try {
      const records = await offlineStorage.getQueuedRecords();
      if (records.length === 0) {
        setIsSyncing(false);
        return { committed: 0, conflicts: 0, message: 'Offline queue is empty. Central registry is up to date.' };
      }

      const instId = user?.institution_id || 'INST-AICTE-101';
      const batchRef = `BATCH-SYNC-${Date.now()}`;

      const payload = {
        institution_id: instId,
        batch_reference: batchRef,
        records: records.map((r) => ({
          client_temp_id: r.id,
          student_id: r.student_id,
          apaar_id: r.apaar_id,
          full_name: r.full_name,
          course: r.course,
          department: r.department,
          academic_year: r.academic_year,
          admission_year: r.admission_year,
          date_of_birth: r.date_of_birth,
          gender: r.gender,
          admission_category: r.admission_category,
          supernumerary_type: r.supernumerary_type,
          nri_status: r.nri_status,
          oci_status: r.oci_status,
          foreign_national: r.foreign_national,
          client_timestamp: r.client_timestamp
        }))
      };

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Server sync push failed');
      }

      const data = await res.json();

      // Clear synced queue from IndexedDB
      await offlineStorage.clearQueue();
      await refreshQueue();

      const now = new Date().toLocaleString();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now);

      // Refresh sync history
      const historyRes = await fetch('/api/sync/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const hData = await historyRes.json();
        setSyncHistory(hData);
      }

      setIsSyncing(false);
      return {
        committed: data.committed_count,
        conflicts: data.conflicts_count,
        message: data.message
      };
    } catch (err: any) {
      setIsSyncing(false);
      throw err;
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        pendingCount: queuedRecords.length,
        queuedRecords,
        isSyncing,
        lastSyncTime,
        syncHistory,
        toggleSimulatedOffline,
        refreshQueue,
        triggerSync,
        queueStudentOffline
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
};
