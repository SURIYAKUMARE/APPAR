import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Student, SyncJob, DuplicateAlert, VerificationStatus
from app.auth import hash_apaar_id
from app.apaar_adapter import APAARNationalSandboxAdapter
from app.validation import validation_engine

class SyncEngine:
    @staticmethod
    def process_sync_batch(
        db: Session,
        institution_id: str,
        batch_reference: str,
        records: List[Dict[str, Any]],
        actor_username: str
    ) -> Dict[str, Any]:
        records_received = len(records)
        records_committed = 0
        conflicts_detected = 0
        conflicts_list = []
        duplicate_count = 0

        for item in records:
            student_id = item.get("student_id")
            apaar_id = item.get("apaar_id")
            full_name = item.get("full_name")
            course = item.get("course")
            dept = item.get("department", course)
            academic_year = item.get("academic_year", "2026-2027")
            admission_year = int(item.get("admission_year", 2026))
            dob = item.get("date_of_birth", "2005-01-01")
            gender = item.get("gender", "Other")
            category = item.get("admission_category", "GENERAL")
            supernumerary = item.get("supernumerary_type", "NONE")
            nri = bool(item.get("nri_status", False))
            oci = bool(item.get("oci_status", False))
            fn = bool(item.get("foreign_national", False))

            apaar_hash = hash_apaar_id(apaar_id)

            # 1. Check if record already synced or exists
            existing_student = db.query(Student).filter(
                Student.student_id == student_id,
                Student.institution_id == institution_id
            ).first()

            if existing_student:
                # Conflict: Record already updated on server
                conflicts_detected += 1
                conflicts_list.append({
                    "student_id": student_id,
                    "apaar_id": apaar_id,
                    "reason": "Record with this Student ID already exists on the Central Registry. Local offline edit superseded.",
                    "resolution": "KEPT_SERVER_VERSION"
                })
                continue

            # 2. Check for duplicate APAAR collisions
            duplicates = validation_engine.check_student_duplicates(db, student_id, apaar_id, institution_id)
            has_cross_duplicate = any(d["duplicate_type"] == "CROSS_INSTITUTION_APAAR" for d in duplicates)

            # 3. APAAR validation via Sandbox
            apaar_result = APAARNationalSandboxAdapter.verify_apaar(apaar_id, full_name, dob)
            initial_status = VerificationStatus.VERIFIED.value if apaar_result["sandbox_verified"] else VerificationStatus.PENDING.value
            if has_cross_duplicate:
                initial_status = VerificationStatus.FLAGGED.value

            new_student = Student(
                student_id=student_id,
                apaar_id=apaar_id,
                apaar_hash=apaar_hash,
                full_name=full_name,
                institution_id=institution_id,
                course=course,
                department=dept,
                academic_year=academic_year,
                admission_year=admission_year,
                date_of_birth=dob,
                gender=gender,
                admission_category=category,
                supernumerary_type=supernumerary,
                nri_status=nri,
                oci_status=oci,
                foreign_national=fn,
                enrollment_status="ACTIVE",
                verification_status=initial_status,
                verification_notes=f"Synced from offline queue: {apaar_result['message']}",
                is_offline_provisional=False # Cleared provisional status once committed
            )
            db.add(new_student)
            db.flush()

            # Record duplicate alerts if any detected
            if duplicates:
                duplicate_count += len(duplicates)
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

            records_committed += 1

        # Record Sync Job
        sync_job = SyncJob(
            institution_id=institution_id,
            batch_reference=batch_reference,
            records_received=records_received,
            records_committed=records_committed,
            conflicts_detected=conflicts_detected,
            status="COMPLETED" if conflicts_detected == 0 else "PARTIALLY_RESOLVED",
            sync_report=json.dumps({
                "committed": records_committed,
                "conflicts": conflicts_list,
                "duplicates": duplicate_count
            })
        )
        db.add(sync_job)
        db.commit()

        return {
            "batch_reference": batch_reference,
            "status": "COMPLETED" if conflicts_detected == 0 else "RESOLVED_WITH_CONFLICTS",
            "committed_count": records_committed,
            "conflicts_count": conflicts_detected,
            "duplicate_count": duplicate_count,
            "conflicts": conflicts_list,
            "message": f"Successfully synchronized {records_committed} offline record(s) to Central National Repository."
        }
