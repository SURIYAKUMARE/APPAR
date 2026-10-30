from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
import secrets
import hashlib
import hmac

from app.database import get_db
from app.models import Student, VerificationRequest, StudentConsent, User, UserRole
from app.schemas import (
    VerificationRequestCreate, VerificationRequestOut,
    StudentConsentOut, ConsentActionRequest
)
from app.auth import get_current_user, create_audit_entry
from app.apaar_adapter import format_masked_apaar
from app.config import settings

router = APIRouter(prefix="/api/verification", tags=["Secure Verification & Student Consent"])

@router.post("/request", response_model=VerificationRequestOut)
def create_verification_request(
    req: VerificationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    qr_ref = f"VR-AICTE-{secrets.token_hex(6).upper()}"
    expires = datetime.now(timezone.utc) + timedelta(days=30)

    # Check if student already gave active consent to this verifier org
    existing_consent = db.query(StudentConsent).filter(
        StudentConsent.student_id == student.id,
        StudentConsent.verifier_org == req.verifier_org,
        StudentConsent.status == "ACTIVE"
    ).first()

    status_val = "CONSENT_GRANTED" if existing_consent else "REQUESTED"
    
    # Generate digital signature
    signature_payload = f"VERIFIED|{student.id}|{student.institution_id}|{qr_ref}|{expires.isoformat()}"
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_payload.encode('utf-8'), hashlib.sha256).hexdigest()

    v_req = VerificationRequest(
        qr_reference=qr_ref,
        student_id=student.id,
        verifier_org=req.verifier_org,
        verifier_role=req.verifier_role,
        purpose=req.purpose,
        status=status_val,
        digital_signature=f"AICTE-SIG-{signature[:28].upper()}",
        expires_at=expires
    )
    db.add(v_req)
    db.commit()
    db.refresh(v_req)

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "VERIFICATION_REQUEST_CREATED",
        "VERIFICATION",
        qr_ref,
        f"Verifier: {req.verifier_org}, Purpose: {req.purpose}"
    )

    return v_req

@router.get("/qr/{qr_reference}")
def get_verification_by_qr(qr_reference: str, db: Session = Depends(get_db)):
    """
    Publicly accessible verification scan endpoint.
    Only returns MINIMUM NECESSARY information with masked APAAR ID.
    Enforces privacy and consent rules.
    """
    v_req = db.query(VerificationRequest).filter(VerificationRequest.qr_reference == qr_reference).first()
    if not v_req:
        raise HTTPException(status_code=404, detail="Invalid or expired verification reference code.")

    if v_req.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Verification request has expired.")

    student = db.query(Student).filter(Student.id == v_req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # Check student consent
    consent = db.query(StudentConsent).filter(
        StudentConsent.student_id == student.id,
        StudentConsent.verifier_org == v_req.verifier_org,
        StudentConsent.status == "ACTIVE"
    ).first()

    is_consent_active = bool(consent or v_req.status == "CONSENT_GRANTED")

    # Safe minimal payload
    return {
        "qr_reference": v_req.qr_reference,
        "status": v_req.status,
        "student_name": student.full_name,
        "masked_apaar_id": format_masked_apaar(student.apaar_id),
        "institution_id": student.institution_id,
        "course": student.course,
        "academic_year": student.academic_year,
        "enrollment_status": student.enrollment_status,
        "apaar_verification_status": student.verification_status,
        "consent_status": "GRANTED" if is_consent_active else "PENDING_STUDENT_APPROVAL",
        "verifier_org": v_req.verifier_org,
        "purpose": v_req.purpose,
        "digital_signature": v_req.digital_signature if is_consent_active else None,
        "expires_at": v_req.expires_at,
        "governing_authority": "AICTE Regulation Bureau - National APAAR Depository"
    }

@router.get("/students/{student_id}/consents", response_model=List[StudentConsentOut])
def get_student_consents(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Student portal check
    if current_user.role == UserRole.STUDENT.value and current_user.full_name != student.full_name:
        raise HTTPException(status_code=403, detail="Forbidden.")

    consents = db.query(StudentConsent).filter(StudentConsent.student_id == student_id).all()
    return consents

@router.post("/students/{student_id}/consents/{consent_id}/action")
def update_student_consent(
    student_id: int,
    consent_id: int,
    action_req: ConsentActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(StudentConsent).filter(
        StudentConsent.id == consent_id,
        StudentConsent.student_id == student_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found.")

    if action_req.action == "REVOKE":
        consent.status = "REVOKED"
    elif action_req.action == "GRANT":
        consent.status = "ACTIVE"
        consent.expires_at = datetime.now(timezone.utc) + timedelta(days=90)

    db.commit()

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "CONSENT_STATUS_MODIFIED",
        "CONSENT",
        str(consent.id),
        f"Action: {action_req.action} for Verifier '{consent.verifier_org}'"
    )

    return {"status": "SUCCESS", "new_status": consent.status}
