from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models import SyncJob, Student, User, UserRole
from app.schemas import SyncPushRequest, SyncPushResponse, StudentOut
from app.auth import get_current_user, create_audit_entry
from app.sync_engine import SyncEngine

router = APIRouter(prefix="/api/sync", tags=["Offline-First Synchronization Engine"])

@router.post("/push", response_model=SyncPushResponse)
def push_offline_sync(
    req: SyncPushRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Security check: institution can only push for itself
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if current_user.institution_id != req.institution_id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot synchronize records for a different institution.")

    result = SyncEngine.process_sync_batch(
        db=db,
        institution_id=req.institution_id,
        batch_reference=req.batch_reference,
        records=[r.model_dump() for r in req.records],
        actor_username=current_user.username
    )

    create_audit_entry(
        db,
        current_user.username,
        current_user.role,
        "OFFLINE_SYNC_PUSH",
        "SYNC_JOB",
        req.batch_reference,
        f"Committed: {result['committed_count']}, Conflicts: {result['conflicts_count']}, Duplicates: {result['duplicate_count']}"
    )

    return SyncPushResponse(**result)

@router.get("/pull", response_model=Dict[str, Any])
def pull_sync_updates(
    institution_id: str,
    since_timestamp: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in [UserRole.INSTITUTION_ADMIN.value, UserRole.ADMISSION_OFFICER.value]:
        if current_user.institution_id != institution_id:
            raise HTTPException(status_code=403, detail="Forbidden.")

    query = db.query(Student).filter(Student.institution_id == institution_id)
    students = query.all()

    return {
        "institution_id": institution_id,
        "records_count": len(students),
        "synced_at": "2026-10-30T23:00:00Z",
        "records": [StudentOut.model_validate(s) for s in students]
    }

@router.get("/history")
def get_sync_history(
    institution_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_inst = current_user.institution_id if current_user.institution_id else institution_id
    query = db.query(SyncJob)
    if target_inst:
        query = query.filter(SyncJob.institution_id == target_inst)

    jobs = query.order_by(SyncJob.created_at.desc()).limit(20).all()
    return [
        {
            "id": j.id,
            "institution_id": j.institution_id,
            "batch_reference": j.batch_reference,
            "records_received": j.records_received,
            "records_committed": j.records_committed,
            "conflicts_detected": j.conflicts_detected,
            "status": j.status,
            "sync_report": j.sync_report,
            "created_at": j.created_at
        }
        for j in jobs
    ]
