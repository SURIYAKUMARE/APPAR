from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models import DuplicateAlert, AnomalyEvent, Student, User, UserRole, VerificationStatus
from app.schemas import (
    APAARVerifyRequest, APAARVerifyResponse,
    DuplicateAlertOut, DuplicateResolveRequest,
    AnomalyEventOut, AnomalyResolveRequest
)
from app.auth import get_current_user, create_audit_entry
from app.apaar_adapter import APAARNationalSandboxAdapter
from app.validation import validation_engine

router = APIRouter(prefix="", tags=["Validation Engine & Anomaly Intelligence"])

@router.post("/api/apaar/verify", response_model=APAARVerifyResponse)
def verify_apaar_identifier(req: APAARVerifyRequest, current_user: User = Depends(get_current_user)):
    result = APAARNationalSandboxAdapter.verify_apaar(
        apaar_id=req.apaar_id,
        student_name=req.student_name or "",
        dob=req.date_of_birth or ""
    )
    return APAARVerifyResponse(**result)

@router.post("/api/admissions/validate")
def validate_admission_limits(
    institution_id: str,
    course_name: str,
    academic_year: str = "2026-2027",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = validation_engine.check_admission_compliance(db, institution_id, course_name, academic_year)
    return result

@router.get("/api/duplicates", response_model=List[DuplicateAlertOut])
def list_duplicate_alerts(
    status: Optional[str] = Query(None),
    institution_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DuplicateAlert).join(Student, DuplicateAlert.student_id == Student.id)

    # ABAC isolation
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        query = query.filter(
            (Student.institution_id == current_user.institution_id) |
            (DuplicateAlert.conflicting_institution_id == current_user.institution_id)
        )
    elif institution_id:
        query = query.filter(
            (Student.institution_id == institution_id) |
            (DuplicateAlert.conflicting_institution_id == institution_id)
        )

    if status:
        query = query.filter(DuplicateAlert.status == status)

    return query.order_by(DuplicateAlert.created_at.desc()).all()

@router.post("/api/duplicates/{alert_id}/resolve")
def resolve_duplicate_alert(
    alert_id: int,
    req: DuplicateResolveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.REGULATION_OFFICER.value, UserRole.INSTITUTION_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Unauthorized to resolve duplicate alerts.")

    alert = db.query(DuplicateAlert).filter(DuplicateAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Duplicate alert not found.")

    alert.status = req.resolution
    alert.resolution_notes = req.notes
    alert.assigned_officer = req.officer_name

    # If resolved as genuine, update student status to VERIFIED
    student = db.query(Student).filter(Student.id == alert.student_id).first()
    if student and req.resolution == "RESOLVED_GENUINE":
        student.verification_status = VerificationStatus.VERIFIED.value
        student.verification_notes = f"Flag cleared by {req.officer_name}: {req.notes}"
    elif student and req.resolution == "REJECTED_DUPLICATE":
        student.verification_status = VerificationStatus.REJECTED.value
        student.enrollment_status = "WITHDRAWN"
        student.verification_notes = f"Rejected duplicate admission: {req.notes}"

    db.commit()

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "DUPLICATE_ALERT_RESOLVED",
        "DUPLICATE_ALERT",
        str(alert.id),
        f"Resolution: {req.resolution} by {req.officer_name}"
    )

    return {"status": "SUCCESS", "message": f"Duplicate alert marked as {req.resolution}."}

@router.get("/api/anomalies", response_model=List[AnomalyEventOut])
def list_anomalies(
    institution_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AnomalyEvent)

    # ABAC isolation
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        query = query.filter(AnomalyEvent.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(AnomalyEvent.institution_id == institution_id)

    if severity:
        query = query.filter(AnomalyEvent.severity == severity)
    if status:
        query = query.filter(AnomalyEvent.status == status)

    return query.order_by(AnomalyEvent.created_at.desc()).all()

@router.post("/api/anomalies/{anomaly_id}/resolve")
def resolve_anomaly(
    anomaly_id: int,
    req: AnomalyResolveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.REGULATION_OFFICER.value]:
        raise HTTPException(status_code=403, detail="Only AICTE Regulation Bureau Officers can triage anomaly events.")

    anomaly = db.query(AnomalyEvent).filter(AnomalyEvent.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly event not found.")

    anomaly.status = req.status
    anomaly.assigned_officer = req.officer_name

    db.commit()

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "ANOMALY_STATUS_UPDATED",
        "ANOMALY",
        str(anomaly.id),
        f"Anomaly triage: {req.status} by {req.officer_name}. Notes: {req.notes}"
    )

    return {"status": "SUCCESS", "message": f"Anomaly triage updated to {req.status}."}
