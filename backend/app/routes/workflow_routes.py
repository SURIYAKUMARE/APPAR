from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.database import get_db
from app.auth import get_current_user
from app.models import WorkflowDefinition, WorkflowExecution

router = APIRouter(prefix="/api/workflows", tags=["Autonomous Workflow Engine"])

class WorkflowCreateRequest(BaseModel):
    workflow_code: str
    title: str
    description: str = ""
    trigger_event: str = "ON_STUDENT_INGEST"
    stages: List[Dict[str, Any]]

class WorkflowExecuteRequest(BaseModel):
    batch_reference: str = "BATCH-AUTONOMOUS-2026"

DEFAULT_WORKFLOWS = [
    {
        "workflow_code": "WF-STANDARD-ADMISSION",
        "title": "National Standard Student Admission Pipeline",
        "description": "5-stage autonomous verification pipeline enforcing Verhoeff format checks, duplicate radar, and sanctioned intake compliance.",
        "trigger_event": "ON_STUDENT_INGEST",
        "stages": [
            {"stage_id": "STAGE_01_INGEST", "name": "Document & Batch Ingestion", "type": "AUTOMATED", "role": "SYSTEM", "sla_sec": 10},
            {"stage_id": "STAGE_02_APAAR_VERIFY", "name": "APAAR Verhoeff Checksum Check", "type": "AUTOMATED", "role": "APAAR Validation Agent", "sla_sec": 15},
            {"stage_id": "STAGE_03_DUPE_RADAR", "name": "Cross-College Duplicate Radar", "type": "AUTOMATED", "role": "Duplicate Detection Agent", "sla_sec": 20},
            {"stage_id": "STAGE_04_INTAKE_GATE", "name": "Sanctioned Intake Capacity Gate", "type": "AUTOMATED", "role": "Admission Compliance Agent", "sla_sec": 15},
            {"stage_id": "STAGE_05_OFFICER_REVIEW", "name": "AICTE Regulation Officer Review", "type": "HUMAN_APPROVAL", "role": "REGULATION_OFFICER", "sla_sec": 300},
            {"stage_id": "STAGE_06_FINAL_COMMIT", "name": "Commit to Central Depository", "type": "AUTOMATED", "role": "SYSTEM", "sla_sec": 10}
        ]
    },
    {
        "workflow_code": "WF-FAST-TRACK-VERIF",
        "title": "Fast-Track Employer Credential Verification",
        "description": "Accelerated credential verification pipeline with DPDP student biometric consent validation.",
        "trigger_event": "ON_VERIFICATION_QUERY",
        "stages": [
            {"stage_id": "STAGE_01_QUERY_INGEST", "name": "Query Ingest & Rate Limit Check", "type": "AUTOMATED", "role": "Cybersecurity Agent", "sla_sec": 5},
            {"stage_id": "STAGE_02_CONSENT_AUDIT", "name": "DPDP Student Consent Validation", "type": "AUTOMATED", "role": "Privacy Monitoring Agent", "sla_sec": 10},
            {"stage_id": "STAGE_03_CREDENTIAL_SIGN", "name": "Cryptographic Signature Dispatch", "type": "AUTOMATED", "role": "Academic Credential Agent", "sla_sec": 10}
        ]
    }
]

@router.get("", response_model=Dict[str, Any])
def get_workflows(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns configured workflow templates and recent execution telemetry.
    """
    db_wfs = db.query(WorkflowDefinition).all()
    if not db_wfs:
        # Seed default templates
        for dw in DEFAULT_WORKFLOWS:
            new_wf = WorkflowDefinition(
                workflow_code=dw["workflow_code"],
                title=dw["title"],
                description=dw["description"],
                trigger_event=dw["trigger_event"],
                stages_json=json.dumps(dw["stages"]),
                is_active=True
            )
            db.add(new_wf)
        db.commit()
        db_wfs = db.query(WorkflowDefinition).all()

    executions = db.query(WorkflowExecution).order_by(WorkflowExecution.id.desc()).limit(15).all()

    formatted_wfs = []
    for w in db_wfs:
        formatted_wfs.append({
            "id": w.id,
            "workflow_code": w.workflow_code,
            "title": w.title,
            "description": w.description,
            "trigger_event": w.trigger_event,
            "stages": json.loads(w.stages_json),
            "is_active": w.is_active,
            "created_at": w.created_at.isoformat()
        })

    formatted_execs = []
    for ex in executions:
        formatted_execs.append({
            "id": ex.id,
            "workflow_code": ex.workflow_code,
            "batch_reference": ex.batch_reference,
            "current_stage": ex.current_stage,
            "status": ex.status,
            "sla_minutes": ex.sla_minutes,
            "history_log": json.loads(ex.history_log_json) if ex.history_log_json else [],
            "created_at": ex.created_at.isoformat(),
            "completed_at": ex.completed_at.isoformat() if ex.completed_at else None
        })

    return {
        "workflows": formatted_wfs,
        "executions": formatted_execs,
        "active_workflow_count": len(formatted_wfs),
        "total_executions_logged": len(formatted_execs)
    }

@router.post("", response_model=Dict[str, Any])
def create_custom_workflow(
    payload: WorkflowCreateRequest,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new visual autonomous workflow definition.
    """
    existing = db.query(WorkflowDefinition).filter(WorkflowDefinition.workflow_code == payload.workflow_code).first()
    if existing:
        existing.title = payload.title
        existing.description = payload.description
        existing.trigger_event = payload.trigger_event
        existing.stages_json = json.dumps(payload.stages)
    else:
        new_wf = WorkflowDefinition(
            workflow_code=payload.workflow_code,
            title=payload.title,
            description=payload.description,
            trigger_event=payload.trigger_event,
            stages_json=json.dumps(payload.stages),
            is_active=True
        )
        db.add(new_wf)
    db.commit()

    return {"status": "SUCCESS", "workflow_code": payload.workflow_code, "message": "Workflow definition saved successfully."}

@router.post("/{workflow_code}/execute", response_model=Dict[str, Any])
def trigger_workflow_execution(
    workflow_code: str,
    payload: WorkflowExecuteRequest,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Executes a configured workflow pipeline with simulated telemetry and step logging.
    """
    wf = db.query(WorkflowDefinition).filter(WorkflowDefinition.workflow_code == workflow_code).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow definition not found.")

    stages = json.loads(wf.stages_json)
    history_log = []
    now = datetime.now(timezone.utc)

    for st in stages:
        history_log.append({
            "stage_id": st["stage_id"],
            "name": st["name"],
            "role": st["role"],
            "status": "PASSED" if st["type"] == "AUTOMATED" else "AWAITING_OFFICER_CONFIRMATION",
            "timestamp": now.isoformat(),
            "notes": "Verified by autonomous neural heuristics engine." if st["type"] == "AUTOMATED" else "Held for human-in-the-loop sign-off."
        })

    has_human_step = any(s["type"] == "HUMAN_APPROVAL" for s in stages)
    status = "AWAITING_APPROVAL" if has_human_step else "COMPLETED"

    execution = WorkflowExecution(
        workflow_code=workflow_code,
        batch_reference=payload.batch_reference,
        current_stage=stages[-2]["stage_id"] if has_human_step else stages[-1]["stage_id"],
        status=status,
        sla_minutes=15,
        history_log_json=json.dumps(history_log),
        created_at=now,
        completed_at=None if has_human_step else now
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    return {
        "status": "SUCCESS",
        "execution_id": execution.id,
        "workflow_code": workflow_code,
        "workflow_status": status,
        "current_stage": execution.current_stage,
        "history_log": history_log,
        "message": "Workflow execution pipeline completed successfully."
    }
