export type UserRole = 
  | 'SUPER_ADMIN'
  | 'REGULATION_OFFICER'
  | 'STATE_NODAL_OFFICER'
  | 'INSTITUTION_ADMIN'
  | 'ADMISSION_OFFICER'
  | 'STUDENT'
  | 'EXTERNAL_VERIFIER'
  | 'AUDITOR';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution_id?: string;
  state?: string;
  is_active: boolean;
  mfa_enabled: boolean;
}

export interface Student {
  id: number;
  student_id: string;
  apaar_id: string;
  apaar_hash?: string;
  full_name: string;
  institution_id: string;
  course: string;
  department: string;
  academic_year: string;
  admission_year: number;
  date_of_birth: string;
  gender: string;
  admission_category: string;
  supernumerary_type: string;
  nri_status: boolean;
  oci_status: boolean;
  foreign_national: boolean;
  enrollment_status: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'FLAGGED' | 'REJECTED';
  verification_notes?: string;
  is_offline_provisional: boolean;
  created_at?: string;
}

export interface ApprovedIntake {
  id: number;
  course_name: string;
  academic_year: string;
  approved_seats: number;
  supernumerary_quota: number;
}

export interface Institution {
  id: string;
  aishe_code: string;
  name: string;
  state: string;
  district: string;
  category: string;
  status: string;
  compliance_score: number;
  total_approved_intake: number;
  contact_email: string;
  approved_intakes?: ApprovedIntake[];
}

export interface DuplicateAlert {
  id: number;
  duplicate_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  student_id: number;
  conflicting_student_id?: number;
  conflicting_institution_id?: string;
  description: string;
  status: 'UNDER_REVIEW' | 'RESOLVED_GENUINE' | 'REJECTED_DUPLICATE';
  assigned_officer: string;
  resolution_notes?: string;
  created_at: string;
  student?: Student;
}

export interface AnomalyEvent {
  id: number;
  institution_id: string;
  event_type: string;
  risk_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  recommended_action: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  assigned_officer?: string;
  created_at: string;
}

export interface OfflineQueuedRecord {
  id: string; // client local uuid
  student_id: string;
  apaar_id: string;
  full_name: string;
  course: string;
  department: string;
  academic_year: string;
  admission_year: number;
  date_of_birth: string;
  gender: string;
  admission_category: string;
  supernumerary_type: string;
  nri_status: boolean;
  oci_status: boolean;
  foreign_national: boolean;
  client_timestamp: string;
  status: 'PENDING_SYNC' | 'FAILED' | 'CONFLICT';
  error_message?: string;
}

export interface SyncHistoryItem {
  id: number;
  institution_id: string;
  batch_reference: string;
  records_received: number;
  records_committed: number;
  conflicts_detected: number;
  status: string;
  sync_report?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  actor_username: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address: string;
  tamper_hash: string;
}

export interface SecurityEvent {
  id: number;
  timestamp: string;
  event_type: string;
  actor?: string;
  ip_address: string;
  user_agent?: string;
  severity: string;
  details?: string;
  resolved: boolean;
}

export interface DashboardKPIs {
  total_institutions: number;
  total_students: number;
  verified_apaar: number;
  pending_verification: number;
  flagged_duplicates: number;
  institutions_exceeding_intake: number;
  total_approved_intake: number;
  total_actual_enrolment: number;
  total_supernumerary: number;
  total_nri: number;
  total_oci: number;
  total_foreign_national: number;
  apaar_verification_rate: number;
}
