from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    REGULATION_OFFICER = "REGULATION_OFFICER"
    STATE_NODAL_OFFICER = "STATE_NODAL_OFFICER"
    INSTITUTION_ADMIN = "INSTITUTION_ADMIN"
    ADMISSION_OFFICER = "ADMISSION_OFFICER"
    STUDENT = "STUDENT"
    EXTERNAL_VERIFIER = "EXTERNAL_VERIFIER"
    AUDITOR = "AUDITOR"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    FLAGGED = "FLAGGED"
    REJECTED = "REJECTED"

class AnomalySeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.INSTITUTION_ADMIN.value)
    institution_id = Column(String(50), ForeignKey("institutions.id"), nullable=True)
    state = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=True)
    totp_secret = Column(String(100), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="users")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(50), primary_key=True, index=True) # e.g. "INST-001" or AICTE Approval ID
    aishe_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    category = Column(String(100), default="Technical & Engineering")
    status = Column(String(50), default="APPROVED") # APPROVED, SUSPENDED, AUDIT_FLAGGED
    compliance_score = Column(Float, default=95.0)
    total_approved_intake = Column(Integer, default=600)
    contact_email = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="institution")
    students = relationship("Student", back_populates="institution")
    approved_intakes = relationship("ApprovedIntake", back_populates="institution")
    anomalies = relationship("AnomalyEvent", back_populates="institution")

class ApprovedIntake(Base):
    __tablename__ = "approved_intakes"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(String(50), ForeignKey("institutions.id"), nullable=False)
    course_name = Column(String(150), nullable=False) # e.g. "B.Tech Computer Science"
    academic_year = Column(String(20), nullable=False) # e.g. "2026-2027"
    approved_seats = Column(Integer, nullable=False)
    supernumerary_quota = Column(Integer, default=15) # Allowed supernumerary cap (TFW + EWS + FN etc.)

    institution = relationship("Institution", back_populates="approved_intakes")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(100), index=True, nullable=False) # College roll no / reg no
    apaar_id = Column(String(50), index=True, nullable=False) # 12-digit APAAR ID
    apaar_hash = Column(String(128), index=True, nullable=False) # Privacy-preserving HMAC hash
    full_name = Column(String(255), nullable=False)
    institution_id = Column(String(50), ForeignKey("institutions.id"), nullable=False)
    course = Column(String(150), nullable=False)
    department = Column(String(150), nullable=False)
    academic_year = Column(String(20), nullable=False, default="2026-2027")
    admission_year = Column(Integer, default=2026)
    date_of_birth = Column(String(20), nullable=False)
    gender = Column(String(20), default="Other")
    
    # Admission Categories & Quotas
    admission_category = Column(String(50), default="GENERAL") # GENERAL, OBC, SC, ST, EWS
    supernumerary_type = Column(String(50), default="NONE") # NONE, TFW, PMSSS, DEFENSE, SPORTS
    nri_status = Column(Boolean, default=False)
    oci_status = Column(Boolean, default=False)
    foreign_national = Column(Boolean, default=False)

    enrollment_status = Column(String(50), default="ACTIVE") # ACTIVE, PROVISIONAL, WITHDRAWN, GRADUATED
    verification_status = Column(String(50), default=VerificationStatus.PENDING.value)
    verification_notes = Column(Text, nullable=True)
    is_offline_provisional = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="students")
    duplicate_alerts = relationship("DuplicateAlert", foreign_keys="DuplicateAlert.student_id", back_populates="student")

class DuplicateAlert(Base):
    __tablename__ = "duplicate_alerts"

    id = Column(Integer, primary_key=True, index=True)
    duplicate_type = Column(String(50), nullable=False) # "CROSS_INSTITUTION_APAAR", "STUDENT_ID_COLLISION", "REPEAT_ENROLMENT"
    severity = Column(String(20), default=AnomalySeverity.HIGH.value)
    risk_score = Column(Float, default=85.0)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    conflicting_student_id = Column(Integer, nullable=True)
    conflicting_institution_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="UNDER_REVIEW") # "UNDER_REVIEW", "RESOLVED_GENUINE", "REJECTED_DUPLICATE"
    assigned_officer = Column(String(100), default="AICTE Regulation Bureau")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", foreign_keys=[student_id], back_populates="duplicate_alerts")

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(String(50), ForeignKey("institutions.id"), nullable=False)
    event_type = Column(String(100), nullable=False) # "EXCESS_INTAKE", "SURGE_BATCH_UPLOAD", "ABNORMAL_SUPERNUMERARY", "REPEATED_CORRECTIONS"
    risk_score = Column(Float, nullable=False)
    severity = Column(String(20), default=AnomalySeverity.HIGH.value)
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN") # "OPEN", "INVESTIGATING", "RESOLVED"
    assigned_officer = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="anomalies")

class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    qr_reference = Column(String(100), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    verifier_org = Column(String(255), nullable=False)
    verifier_role = Column(String(100), default="Employer / Third-Party Verifier")
    purpose = Column(String(255), nullable=False)
    status = Column(String(50), default="REQUESTED") # "REQUESTED", "CONSENT_GRANTED", "CONSENT_DENIED", "COMPLETED"
    digital_signature = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)

class StudentConsent(Base):
    __tablename__ = "student_consents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    verifier_org = Column(String(255), nullable=False)
    purpose = Column(String(255), nullable=False)
    shared_fields = Column(String(255), default="name,course,institution,enrollment_status")
    status = Column(String(50), default="ACTIVE") # "ACTIVE", "REVOKED", "EXPIRED"
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actor_username = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    tamper_hash = Column(String(128), nullable=False) # SHA-256 chain hash for tamper-evident ledger

class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(String(50), ForeignKey("institutions.id"), nullable=False)
    batch_reference = Column(String(100), nullable=False)
    records_received = Column(Integer, default=0)
    records_committed = Column(Integer, default=0)
    conflicts_detected = Column(Integer, default=0)
    status = Column(String(50), default="COMPLETED") # "IN_PROGRESS", "COMPLETED", "FAILED"
    sync_report = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(100), nullable=False) # "SUSPICIOUS_LOGIN", "FAILED_MFA", "RATE_LIMIT_EXCEEDED", "UNAUTHORIZED_ACCESS"
    actor = Column(String(100), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    user_agent = Column(String(255), nullable=True)
    severity = Column(String(20), default=AnomalySeverity.MEDIUM.value)
    details = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
