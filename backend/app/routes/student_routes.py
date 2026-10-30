from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import csv
import io

from app.database import get_db
from app.models import Student, Institution, DuplicateAlert, User, UserRole, VerificationStatus, AnomalySeverity
from app.schemas import StudentCreate, StudentUpdate, StudentOut
from app.auth import get_current_user, hash_apaar_id, create_audit_entry
from app.apaar_adapter import APAARNationalSandboxAdapter
from app.validation import validation_engine

router = APIRouter(prefix="/api/students", tags=["Student Management & APAAR Registration"])

@router.get("", response_model=Dict[str, Any])
def list_students(
    institution_id: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    supernumerary_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    # ABAC / RBAC Tenant Data Isolation
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        # Strictly restricted to own institution
        query = query.filter(Student.institution_id == current_user.institution_id)
    elif current_user.role == UserRole.STUDENT.value:
        # Student can only view their own profile!
        query = query.filter(Student.full_name == current_user.full_name)
    elif institution_id:
        query = query.filter(Student.institution_id == institution_id)

    if course:
        query = query.filter(Student.course == course)
    if verification_status:
        query = query.filter(Student.verification_status == verification_status)
    if supernumerary_type and supernumerary_type != "ALL":
        query = query.filter(Student.supernumerary_type == supernumerary_type)
    if search:
        query = query.filter(
            (Student.full_name.ilike(f"%{search}%")) |
            (Student.student_id.ilike(f"%{search}%")) |
            (Student.apaar_id.ilike(f"%{search}%"))
        )

    total_count = query.count()
    offset = (page - 1) * limit
    students = query.order_by(Student.id.desc()).offset(offset).limit(limit).all()

    # Convert to schema
    student_outs = [StudentOut.model_validate(s) for s in students]

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit,
        "items": student_outs
    }

@router.get("/{student_id}", response_model=StudentOut)
def get_student_by_id(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    # Isolation check
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if student.institution_id != current_user.institution_id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot view student records of another institution.")

    return student

@router.post("", response_model=StudentOut)
def register_student(
    student_in: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce role permission
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        raise HTTPException(status_code=403, detail="Only authorized college admission officers or AICTE administrators may register students.")

    target_inst = current_user.institution_id if current_user.institution_id else student_in.institution_id
    if not target_inst:
        raise HTTPException(status_code=400, detail="Institution ID is required.")

    # 1. Run Duplicate Detection Engine
    duplicates = validation_engine.check_student_duplicates(db, student_in.student_id, student_in.apaar_id, target_inst)

    # 2. Run APAAR Sandbox Verification
    apaar_verif = APAARNationalSandboxAdapter.verify_apaar(student_in.apaar_id, student_in.full_name, student_in.date_of_birth)

    initial_status = VerificationStatus.VERIFIED.value if apaar_verif["sandbox_verified"] else VerificationStatus.PENDING.value
    if duplicates:
        initial_status = VerificationStatus.FLAGGED.value

    # 3. Create Student Record
    apaar_hash = hash_apaar_id(student_in.apaar_id)
    new_student = Student(
        student_id=student_in.student_id,
        apaar_id=student_in.apaar_id,
        apaar_hash=apaar_hash,
        full_name=student_in.full_name,
        institution_id=target_inst,
        course=student_in.course,
        department=student_in.department,
        academic_year=student_in.academic_year,
        admission_year=student_in.admission_year,
        date_of_birth=student_in.date_of_birth,
        gender=student_in.gender,
        admission_category=student_in.admission_category,
        supernumerary_type=student_in.supernumerary_type,
        nri_status=student_in.nri_status,
        oci_status=student_in.oci_status,
        foreign_national=student_in.foreign_national,
        enrollment_status="ACTIVE",
        verification_status=initial_status,
        verification_notes=apaar_verif["message"],
        is_offline_provisional=student_in.is_offline_provisional
    )
    db.add(new_student)
    db.flush()

    # If duplicates were flagged, create DuplicateAlert records
    for d in duplicates:
        alert = DuplicateAlert(
            duplicate_type=d["duplicate_type"],
            severity=d["severity"],
            risk_score=d["risk_score"],
            student_id=new_student.id,
            conflicting_student_id=d.get("conflicting_student_id"),
            conflicting_institution_id=d.get("conflicting_institution_id"),
            description=d["description"],
            status="UNDER_REVIEW",
            assigned_officer="AICTE Regulation Bureau"
        )
        db.add(alert)

    db.commit()
    db.refresh(new_student)

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "STUDENT_REGISTERED",
        "STUDENT",
        str(new_student.id),
        f"Registered {new_student.full_name} ({new_student.student_id}). Duplicates flagged: {len(duplicates)}"
    )

    return new_student

@router.post("/bulk-upload")
async def bulk_upload_students(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        raise HTTPException(status_code=403, detail="Unauthorized for bulk registration.")

    inst_id = current_user.institution_id or "INST-AICTE-101"
    contents = await file.read()
    
    try:
        decoded = contents.decode('utf-8')
    except Exception:
        decoded = contents.decode('latin-1')

    reader = csv.DictReader(io.StringIO(decoded))
    
    records_processed = 0
    records_inserted = 0
    duplicates_detected = 0
    errors = []

    for row in reader:
        records_processed += 1
        name = row.get("full_name") or row.get("name")
        apaar = row.get("apaar_id") or row.get("apaar")
        sid = row.get("student_id") or row.get("roll_no")
        course = row.get("course") or "Computer Science and Engineering"
        dept = row.get("department") or "CSE"
        dob = row.get("date_of_birth") or "2005-01-01"
        cat = row.get("admission_category") or "GENERAL"
        supernumerary = row.get("supernumerary_type") or "NONE"

        if not name or not apaar or not sid:
            errors.append(f"Row {records_processed}: Missing required name, apaar_id, or student_id.")
            continue

        dupes = validation_engine.check_student_duplicates(db, sid, apaar, inst_id)
        if dupes:
            duplicates_detected += len(dupes)

        verif = APAARNationalSandboxAdapter.verify_apaar(apaar, name, dob)
        status = VerificationStatus.VERIFIED.value if verif["sandbox_verified"] else VerificationStatus.PENDING.value
        if dupes:
            status = VerificationStatus.FLAGGED.value

        student = Student(
            student_id=sid,
            apaar_id=apaar,
            apaar_hash=hash_apaar_id(apaar),
            full_name=name,
            institution_id=inst_id,
            course=course,
            department=dept,
            academic_year="2026-2027",
            admission_year=2026,
            date_of_birth=dob,
            gender=row.get("gender", "Other"),
            admission_category=cat,
            supernumerary_type=supernumerary,
            enrollment_status="ACTIVE",
            verification_status=status,
            verification_notes=verif["message"]
        )
        db.add(student)
        db.flush()

        for d in dupes:
            alert = DuplicateAlert(
                duplicate_type=d["duplicate_type"],
                severity=d["severity"],
                risk_score=d["risk_score"],
                student_id=student.id,
                conflicting_student_id=d.get("conflicting_student_id"),
                conflicting_institution_id=d.get("conflicting_institution_id"),
                description=d["description"],
                status="UNDER_REVIEW"
            )
            db.add(alert)

        records_inserted += 1

    db.commit()

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "BULK_STUDENT_UPLOAD",
        "INSTITUTION",
        inst_id,
        f"Uploaded {file.filename}: Processed={records_processed}, Inserted={records_inserted}, Duplicates={duplicates_detected}"
    )

    return {
        "status": "SUCCESS",
        "filename": file.filename,
        "records_processed": records_processed,
        "records_inserted": records_inserted,
        "duplicates_detected": duplicates_detected,
        "errors": errors
    }

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    student_update: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Isolation check
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if student.institution_id != current_user.institution_id:
            raise HTTPException(status_code=403, detail="Forbidden.")

    update_dict = student_update.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "STUDENT_RECORD_UPDATED",
        "STUDENT",
        str(student.id),
        f"Updated fields: {list(update_dict.keys())}"
    )

    return student
