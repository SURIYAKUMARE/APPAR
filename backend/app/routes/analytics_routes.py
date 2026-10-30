from fastapi import APIRouter, Depends, Query, Response, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import csv
import io

from app.database import get_db
from app.models import Student, Institution, ApprovedIntake, DuplicateAlert, AnomalyEvent, VerificationStatus, User, UserRole
from app.auth import get_current_user
from app.copilot import AICTECopilotEngine

class CopilotQueryRequest(BaseModel):
    query: str

router = APIRouter(prefix="/api/analytics", tags=["National Analytics & Reports Engine"])

@router.post("/copilot")
def query_aicte_copilot(
    req: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = AICTECopilotEngine.query(
        db=db,
        user_query=req.query,
        user_role=current_user.role,
        institution_id=current_user.institution_id
    )
    return result

@router.get("/dashboard")
def get_dashboard_analytics(
    state: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    academic_year: Optional[str] = Query("2026-2027"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_query = db.query(Student)
    inst_query = db.query(Institution)

    # ABAC data isolation
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        student_query = student_query.filter(Student.institution_id == current_user.institution_id)
        inst_query = inst_query.filter(Institution.id == current_user.institution_id)
    elif current_user.role == UserRole.STATE_NODAL_OFFICER.value and current_user.state:
        inst_query = inst_query.filter(Institution.state == current_user.state)
        matching_inst_ids = [i.id for i in inst_query.all()]
        student_query = student_query.filter(Student.institution_id.in_(matching_inst_ids))

    if state:
        inst_query = inst_query.filter(Institution.state.ilike(f"%{state}%"))
        matching_inst_ids = [i.id for i in inst_query.all()]
        student_query = student_query.filter(Student.institution_id.in_(matching_inst_ids))

    if course:
        student_query = student_query.filter(Student.course == course)

    if academic_year:
        student_query = student_query.filter(Student.academic_year == academic_year)

    total_institutions = inst_query.count()
    total_students = student_query.count()

    verified_count = student_query.filter(Student.verification_status == VerificationStatus.VERIFIED.value).count()
    pending_count = student_query.filter(Student.verification_status == VerificationStatus.PENDING.value).count()
    flagged_count = student_query.filter(Student.verification_status == VerificationStatus.FLAGGED.value).count()

    total_supernumerary = student_query.filter(Student.supernumerary_type != "NONE").count()
    total_nri = student_query.filter(Student.nri_status == True).count()
    total_oci = student_query.filter(Student.oci_status == True).count()
    total_fn = student_query.filter(Student.foreign_national == True).count()

    # Total approved intake calculation
    intake_query = db.query(func.sum(ApprovedIntake.approved_seats))
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        intake_query = intake_query.filter(ApprovedIntake.institution_id == current_user.institution_id)
    total_approved = intake_query.scalar() or 3800

    # Institutions exceeding intake count
    excess_institutions = db.query(Institution).filter(Institution.status == "AUDIT_FLAGGED").count()

    # State-wise distribution
    state_rows = db.query(
        Institution.state,
        func.count(Student.id).label("student_count")
    ).join(Student, Student.institution_id == Institution.id).group_by(Institution.state).all()

    state_distribution = [{"state": r[0], "students": r[1]} for r in state_rows]

    # Course-wise distribution
    course_rows = student_query.with_entities(
        Student.course,
        func.count(Student.id).label("count")
    ).group_by(Student.course).all()
    course_distribution = [{"course": r[0], "count": r[1]} for r in course_rows]

    # Category distribution
    cat_rows = student_query.with_entities(
        Student.admission_category,
        func.count(Student.id).label("count")
    ).group_by(Student.admission_category).all()
    category_distribution = [{"category": r[0], "count": r[1]} for r in cat_rows]

    # Compliance rankings
    top_compliant = inst_query.order_by(Institution.compliance_score.desc()).limit(10).all()
    compliance_rankings = [
        {
            "id": inst.id,
            "name": inst.name,
            "state": inst.state,
            "compliance_score": inst.compliance_score,
            "status": inst.status,
            "approved_intake": inst.total_approved_intake
        }
        for inst in top_compliant
    ]

    return {
        "kpis": {
            "total_institutions": total_institutions,
            "total_students": total_students,
            "verified_apaar": verified_count,
            "pending_verification": pending_count,
            "flagged_duplicates": flagged_count,
            "institutions_exceeding_intake": excess_institutions,
            "total_approved_intake": total_approved,
            "total_actual_enrolment": total_students,
            "total_supernumerary": total_supernumerary,
            "total_nri": total_nri,
            "total_oci": total_oci,
            "total_foreign_national": total_fn,
            "apaar_verification_rate": round((verified_count / max(1, total_students)) * 100, 1)
        },
        "state_distribution": state_distribution,
        "course_distribution": course_distribution,
        "category_distribution": category_distribution,
        "compliance_rankings": compliance_rankings
    }

@router.get("/export/csv")
def export_students_csv(
    institution_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        query = query.filter(Student.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(Student.institution_id == institution_id)

    students = query.limit(5000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID", "APAAR ID (Masked)", "Student Full Name", "Institution Code",
        "Course", "Department", "Academic Year", "Category", "Supernumerary",
        "Verification Status", "Enrolment Status"
    ])

    for s in students:
        masked_apaar = f"XXXX-XXXX-{s.apaar_id[-4:]}" if len(s.apaar_id) >= 4 else "XXXX-XXXX-XXXX"
        writer.writerow([
            s.student_id,
            masked_apaar,
            s.full_name,
            s.institution_id,
            s.course,
            s.department,
            s.academic_year,
            s.admission_category,
            s.supernumerary_type,
            s.verification_status,
            s.enrollment_status
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=APAAR_ONE_Regulatory_Report.csv"}
    )
