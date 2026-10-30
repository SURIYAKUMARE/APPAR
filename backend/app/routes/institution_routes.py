from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Institution, ApprovedIntake, Student, User, UserRole
from app.schemas import InstitutionOut
from app.auth import get_current_user, require_roles
from app.validation import validation_engine

router = APIRouter(prefix="/api/institutions", tags=["Institution Management & Compliance"])

@router.get("", response_model=List[InstitutionOut])
def list_institutions(
    state: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Institution)

    # ABAC / RBAC Data Isolation
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        # Restricted strictly to their own institution
        query = query.filter(Institution.id == current_user.institution_id)
    elif current_user.role == UserRole.STATE_NODAL_OFFICER.value and current_user.state:
        # Restricted to their allocated state
        query = query.filter(Institution.state == current_user.state)

    if state:
        query = query.filter(Institution.state.ilike(f"%{state}%"))
    if status:
        query = query.filter(Institution.status == status)
    if search:
        query = query.filter(
            (Institution.name.ilike(f"%{search}%")) |
            (Institution.id.ilike(f"%{search}%")) |
            (Institution.aishe_code.ilike(f"%{search}%"))
        )

    return query.all()

@router.get("/{institution_id}", response_model=InstitutionOut)
def get_institution(
    institution_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC data isolation check
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if current_user.institution_id != institution_id:
            raise HTTPException(status_code=403, detail="Forbidden: You are not authorized to view another institution's regulatory record.")

    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution record not found in AICTE registry.")
    return inst

@router.get("/{institution_id}/compliance")
def get_institution_compliance_breakdown(
    institution_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Tenant isolation check
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if current_user.institution_id != institution_id:
            raise HTTPException(status_code=403, detail="Access denied.")

    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    intakes = db.query(ApprovedIntake).filter(ApprovedIntake.institution_id == institution_id).all()
    breakdown = []
    total_approved = 0
    total_enrolled = 0
    total_excess = 0
    total_supernumerary = 0

    for item in intakes:
        compliance = validation_engine.check_admission_compliance(db, institution_id, item.course_name, item.academic_year)
        total_approved += compliance["approved_intake"]
        total_enrolled += compliance["actual_enrolment"]
        total_excess += compliance["excess_regular"]
        total_supernumerary += compliance["supernumerary_count"]

        breakdown.append({
            "course": item.course_name,
            "academic_year": item.academic_year,
            "approved_seats": item.approved_seats,
            "actual_enrolment": compliance["actual_enrolment"],
            "regular_count": compliance["regular_count"],
            "excess_regular": compliance["excess_regular"],
            "supernumerary_count": compliance["supernumerary_count"],
            "supernumerary_quota": compliance["supernumerary_quota"],
            "compliant": compliance["compliant"],
            "has_violations": compliance["has_violations"]
        })

    return {
        "institution_id": institution_id,
        "institution_name": inst.name,
        "compliance_score": inst.compliance_score,
        "status": inst.status,
        "total_approved_intake": total_approved,
        "total_actual_enrolment": total_enrolled,
        "total_excess": total_excess,
        "total_supernumerary": total_supernumerary,
        "courses_breakdown": breakdown
    }
