import { OfflineQueuedRecord, Student } from '../types';

const DB_NAME = 'APAAR_ONE_OFFLINE_DB';
const DB_VERSION = 1;
const QUEUE_STORE = 'sync_queue';
const CACHED_STUDENTS_STORE = 'cached_students';
const OFFLINE_AUDIT_STORE = 'offline_audit';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CACHED_STUDENTS_STORE)) {
        db.createObjectStore(CACHED_STUDENTS_STORE, { keyPath: 'student_id' });
      }
      if (!db.objectStoreNames.contains(OFFLINE_AUDIT_STORE)) {
        db.createObjectStore(OFFLINE_AUDIT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  async queueRecord(record: OfflineQueuedRecord): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE, CACHED_STUDENTS_STORE], 'readwrite');
      const queueStore = tx.objectStore(QUEUE_STORE);
      const studentStore = tx.objectStore(CACHED_STUDENTS_STORE);

      queueStore.put(record);

      // Also store as provisional local student
      const provisionalStudent: Partial<Student> = {
        id: -Date.now(),
        student_id: record.student_id,
        apaar_id: record.apaar_id,
        full_name: record.full_name,
        institution_id: 'LOCAL_INST',
        course: record.course,
        department: record.department,
        academic_year: record.academic_year,
        admission_year: record.admission_year,
        date_of_birth: record.date_of_birth,
        gender: record.gender,
        admission_category: record.admission_category,
        supernumerary_type: record.supernumerary_type,
        nri_status: record.nri_status,
        oci_status: record.oci_status,
        foreign_national: record.foreign_national,
        enrollment_status: 'PROVISIONAL_OFFLINE',
        verification_status: 'PENDING',
        verification_notes: 'Created offline. Pending server synchronization and validation.',
        is_offline_provisional: true,
        created_at: record.client_timestamp
      };
      studentStore.put(provisionalStudent);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getQueuedRecords(): Promise<OfflineQueuedRecord[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async removeQueuedRecord(id: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async clearQueue(): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async cacheServerStudents(students: Student[]): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHED_STUDENTS_STORE, 'readwrite');
      const store = tx.objectStore(CACHED_STUDENTS_STORE);
      students.forEach((s) => store.put(s));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getCachedStudents(): Promise<Student[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHED_STUDENTS_STORE, 'readonly');
      const store = tx.objectStore(CACHED_STUDENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async purgeAllData(): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE, CACHED_STUDENTS_STORE, OFFLINE_AUDIT_STORE], 'readwrite');
      tx.objectStore(QUEUE_STORE).clear();
      tx.objectStore(CACHED_STUDENTS_STORE).clear();
      tx.objectStore(OFFLINE_AUDIT_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
