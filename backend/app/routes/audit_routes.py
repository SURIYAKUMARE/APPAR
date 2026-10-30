from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import AuditLog, SecurityEvent, User, UserRole
from app.schemas import AuditLogOut, SecurityEventOut
from app.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/audit", tags=["Security Monitoring & Immutable Audit Trails"])

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    actor: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only super admin, regulation officer, and auditor can view audit logs
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.REGULATION_OFFICER.value, UserRole.AUDITOR.value]:
        raise HTTPException(status_code=403, detail="Forbidden: Lacks national regulatory auditor clearance.")

    query = db.query(AuditLog)
    if actor:
        query = query.filter(AuditLog.actor_username.ilike(f"%{actor}%"))
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/security-events", response_model=List[SecurityEventOut])
def get_security_events(
    severity: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.REGULATION_OFFICER.value, UserRole.AUDITOR.value]:
        raise HTTPException(status_code=403, detail="Forbidden.")

    query = db.query(SecurityEvent)
    if severity:
        query = query.filter(SecurityEvent.severity == severity)

    return query.order_by(SecurityEvent.timestamp.desc()).limit(100).all()

@router.post("/security-events/{event_id}/resolve")
def resolve_security_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.REGULATION_OFFICER.value]:
        raise HTTPException(status_code=403, detail="Forbidden.")

    event = db.query(SecurityEvent).filter(SecurityEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found.")

    event.resolved = True
    db.commit()
    return {"status": "SUCCESS", "message": "Security event marked as resolved."}
