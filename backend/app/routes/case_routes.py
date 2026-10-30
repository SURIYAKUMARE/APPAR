from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import json

from app.database import get_db
from app.auth import get_current_user
from app.models import RegulatoryCase, Institution, AnomalyEvent

router = APIRouter(prefix="/api/cases", tags=["Regulatory Case Management"])

class CaseStatusUpdate(BaseModel):
    status: str # "OPEN", "UNDER_INQUIRY", "SHOW_CAUSE_ISSUED", "HEARING_SCHEDULED", "RESOLVED"
    officer_notes: str = ""

DEFAULT_CASES = [
    {
        "case_number": "AICTE-CASE-2026-089",
        "institution_id": "INST-AICTE-107",
        "case_type": "EXCESS_INTAKE",
        "title": "Unapproved 10% Surge in B.Tech CSE Intake (132/120 Enrolled)",
        "severity": "CRITICAL",
        "status": "SHOW_CAUSE_ISSUED",
        "assigned_officer": "Dr. Anil Sahasrabudhe (Regulation Bureau)",
        "ai_summary": "Institution INST-AICTE-107 enrolled 132 students against a sanctioned intake of 120 in Computer Science and Engineering for academic year 2026-27. Violates Chapter II, Section 2.4 of the AICTE Approval Process Handbook (APH).",
        "evidence": [
            {"item": "Sanctioned Intake Capacity", "value": "120 seats approved"},
            {"item": "Actual Regular Enrolment", "value": "132 students registered"},
            {"item": "Breach Margin", "value": "+12 unapproved enrolments (10%)"},
            {"item": "Faculty Deficit", "value": "2 Assistant Professors short for 1:20 norm"}
        ]
    },
    {
        "case_number": "AICTE-CASE-2026-092",
        "institution_id": "INST-AICTE-101",
        "case_type": "CROSS_COLLEGE_DUPLICATE",
        "title": "Cross-State Concurrent Dual Admission (APAAR: 982345108742)",
        "severity": "HIGH",
        "status": "UNDER_INQUIRY",
        "assigned_officer": "Smt. Mamta Rani (Bureau Chief)",
        "ai_summary": "Student identity collision detected between INST-AICTE-101 (Delhi) and INST-AICTE-102 (Tamil Nadu). Identical biometric APAAR hash enrolled in regular full-time daytime programs simultaneously.",
        "evidence": [
            {"item": "APAAR Identifier", "value": "982345108742 (Verhoeff Validated)"},
            {"item": "College 1", "value": "Delhi Institute of Technology & Advanced Research"},
            {"item": "College 2", "value": "National College of Engineering & Technology (TN)"},
            {"item": "Collision Heuristic", "value": "Salted HMAC-SHA256 Match across institutional silos"}
        ]
    },
    {
        "case_number": "AICTE-CASE-2026-104",
        "institution_id": "INST-AICTE-103",
        "case_type": "QUOTA_MANIPULATION",
        "title": "Discrepancy in Supernumerary Tuition Fee Waiver (TFW) Ceiling",
        "severity": "MEDIUM",
        "status": "OPEN",
        "assigned_officer": "Shri Rajesh Mehra (State Nodal Officer)",
        "ai_summary": "Supernumerary seat allocations exceeded 5% statutory ceiling in Information Technology branch. Candidate income certificates under verification.",
        "evidence": [
            {"item": "TFW Cap Allowed", "value": "3 seats (5% of 60)"},
            {"item": "TFW Admitted", "value": "5 candidates tagged as TFW"},
            {"item": "Status", "value": "Awaiting college clarification"}
        ]
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def list_regulatory_cases(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns active and archived regulatory inquiry cases with evidence files.
    """
    cases = db.query(RegulatoryCase).order_by(RegulatoryCase.id.desc()).all()
    if not cases:
        # Seed default cases
        now = datetime.now(timezone.utc)
        for dc in DEFAULT_CASES:
            new_case = RegulatoryCase(
                case_number=dc["case_number"],
                institution_id=dc["institution_id"],
                case_type=dc["case_type"],
                title=dc["title"],
                severity=dc["severity"],
                status=dc["status"],
                sla_deadline=now + timedelta(days=7),
                assigned_officer=dc["assigned_officer"],
                ai_summary=dc["ai_summary"],
                evidence_json=json.dumps(dc["evidence"])
            )
            db.add(new_case)
        db.commit()
        cases = db.query(RegulatoryCase).all()

    result = []
    for c in cases:
        result.append({
            "id": c.id,
            "case_number": c.case_number,
            "institution_id": c.institution_id,
            "case_type": c.case_type,
            "title": c.title,
            "severity": c.severity,
            "status": c.status,
            "sla_deadline": c.sla_deadline.isoformat() if c.sla_deadline else None,
            "assigned_officer": c.assigned_officer,
            "ai_summary": c.ai_summary,
            "evidence": json.loads(c.evidence_json) if c.evidence_json else [],
            "created_at": c.created_at.isoformat()
        })
    return result

@router.patch("/{case_id}/status", response_model=Dict[str, Any])
def update_case_status(
    case_id: int,
    payload: CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Updates the regulatory case status (human-in-the-loop action).
    """
    case = db.query(RegulatoryCase).filter(RegulatoryCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Regulatory case not found.")

    case.status = payload.status
    db.commit()

    return {
        "status": "SUCCESS",
        "case_id": case.id,
        "new_status": case.status,
        "message": f"Case {case.case_number} updated to status {payload.status}."
    }
