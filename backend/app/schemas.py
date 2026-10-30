from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    institution_id: Optional[str] = None
    full_name: str
    requires_mfa: bool = False
    temp_session_token: Optional[str] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    captcha_response: Optional[str] = None

class MFARequest(BaseModel):
    temp_session_token: str
    otp_code: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    institution_id: Optional[str] = None
    state: Optional[str] = None
    is_active: bool
    mfa_enabled: bool

    class Config:
        from_attributes = True

class ApprovedIntakeOut(BaseModel):
    id: int
    course_name: str
    academic_year: str
    approved_seats: int
    supernumerary_quota: int

    class Config:
        from_attributes = True

class InstitutionOut(BaseModel):
    id: str
    aishe_code: str
    name: str
    state: str
    district: str
    category: str
    status: str
    compliance_score: float
    total_approved_intake: int
    contact_email: str
    approved_intakes: List[ApprovedIntakeOut] = []

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    student_id: str
    apaar_id: str
    full_name: str
    institution_id: str
    course: str
    department: str
    academic_year: str = "2026-2027"
    admission_year: int = 2026
    date_of_birth: str
    gender: str = "Other"
    admission_category: str = "GENERAL"
    supernumerary_type: str = "NONE"
    nri_status: bool = False
    oci_status: bool = False
    foreign_national: bool = False

class StudentCreate(StudentBase):
    is_offline_provisional: bool = False

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    course: Optional[str] = None
    department: Optional[str] = None
    admission_category: Optional[str] = None
    supernumerary_type: Optional[str] = None
    enrollment_status: Optional[str] = None
    verification_status: Optional[str] = None

class StudentOut(StudentBase):
    id: int
    apaar_hash: str
    enrollment_status: str
    verification_status: str
    verification_notes: Optional[str] = None
    is_offline_provisional: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class APAARVerifyRequest(BaseModel):
    apaar_id: str
    student_name: Optional[str] = None
    date_of_birth: Optional[str] = None

class APAARVerifyResponse(BaseModel):
    apaar_id: str
    is_valid_format: bool
    is_checksum_valid: bool
    sandbox_verified: bool
    message: str
    linked_aadhaar_hash: Optional[str] = None
    name_matched: bool = True
    digital_signature: str
    issued_by: str = "ABC / DigiLocker National Gateway (Sandbox Adapter)"

class DuplicateAlertOut(BaseModel):
    id: int
    duplicate_type: str
    severity: str
    risk_score: float
    student_id: int
    conflicting_student_id: Optional[int] = None
    conflicting_institution_id: Optional[str] = None
    description: str
    status: str
    assigned_officer: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True

class DuplicateResolveRequest(BaseModel):
    resolution: str # RESOLVED_GENUINE or REJECTED_DUPLICATE
    notes: str
    officer_name: str

class AnomalyEventOut(BaseModel):
    id: int
    institution_id: str
    event_type: str
    risk_score: float
    severity: str
    reason: str
    recommended_action: str
    status: str
    assigned_officer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnomalyResolveRequest(BaseModel):
    status: str # INVESTIGATING, RESOLVED, DISMISSED
    officer_name: str
    notes: str

class SyncRecordItem(BaseModel):
    client_temp_id: Optional[str] = None
    student_id: str
    apaar_id: str
    full_name: str
    course: str
    department: str
    academic_year: str
    admission_year: int
    date_of_birth: str
    gender: str
    admission_category: str
    supernumerary_type: str
    nri_status: bool
    oci_status: bool
    foreign_national: bool
    client_timestamp: str

class SyncPushRequest(BaseModel):
    institution_id: str
    batch_reference: str
    records: List[SyncRecordItem]

class SyncPushResponse(BaseModel):
    batch_reference: str
    status: str
    committed_count: int
    conflicts_count: int
    duplicate_count: int
    conflicts: List[Dict[str, Any]] = []
    message: str

class VerificationRequestCreate(BaseModel):
    student_id: int
    verifier_org: str
    verifier_role: str
    purpose: str

class VerificationRequestOut(BaseModel):
    id: int
    qr_reference: str
    student_id: int
    verifier_org: str
    verifier_role: str
    purpose: str
    status: str
    digital_signature: Optional[str] = None
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class StudentConsentOut(BaseModel):
    id: int
    student_id: int
    verifier_org: str
    purpose: str
    shared_fields: str
    status: str
    granted_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class ConsentActionRequest(BaseModel):
    action: str # GRANT or REVOKE
    shared_fields: Optional[str] = None

class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    actor_username: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: str
    tamper_hash: str

    class Config:
        from_attributes = True

class SecurityEventOut(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    actor: Optional[str] = None
    ip_address: str
    user_agent: Optional[str] = None
    severity: str
    details: Optional[str] = None
    resolved: bool

    class Config:
        from_attributes = True

class DashboardStatsOut(BaseModel):
    total_institutions: int
    total_students: int
    verified_apaar_count: int
    pending_verification_count: int
    flagged_duplicate_count: int
    excess_intake_institutions_count: int
    total_approved_intake: int
    total_actual_enrolment: int
    total_supernumerary: int
    total_nri: int
    total_oci: int
    total_foreign_national: int
    compliance_average: float
