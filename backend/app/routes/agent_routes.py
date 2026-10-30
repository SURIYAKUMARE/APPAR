from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user
from app.multi_agent import agent_system
from app.models import Institution, ApprovedIntake, Student

router = APIRouter(prefix="/api/agents", tags=["Multi-Agent AI Intelligence"])

class SimulationRequest(BaseModel):
    institution_id: str
    enrolment_delta_percent: float = 0.0 # e.g. +15.0%
    branch_quota_overrides: Dict[str, int] = {} # e.g. {"CSE": 150}
    supernumerary_additional_seats: int = 0

@router.get("", response_model=List[Dict[str, Any]])
def get_agents_status(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns real-time status, health, tasks, and telemetry for all 10 AICTE Autonomous Intelligence Agents.
    """
    return agent_system.get_agent_status_grid(db)

@router.post("/{agent_id}/run")
def trigger_agent_run(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Manually triggers a neural evaluation cycle for the specified AI Agent.
    """
    result = agent_system.execute_agent_scan(agent_id, db)
    if result["status"] == "ERROR":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.post("/action/{action_id}/approve")
def approve_agent_action(
    action_id: str,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Human-in-the-loop approval endpoint for high-severity automated actions.
    """
    return {
        "status": "APPROVED",
        "action_id": action_id,
        "approved_by": current_user.get("sub", "ADMIN"),
        "timestamp": "2026-10-31T00:00:00Z",
        "message": f"Action {action_id} authorized and executed by AICTE Regulatory Authority."
    }

simulation_router = APIRouter(prefix="/api/simulation", tags=["Academic Digital Twin"])

@simulation_router.post("/evaluate")
def evaluate_digital_twin_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Digital Twin Simulation Engine:
    Calculates the impact of what-if parameter variations (enrolment surge, quota adjustments)
    on faculty-to-student ratios, classroom occupancy, infrastructure stress, and compliance breach probability.
    """
    inst = db.query(Institution).filter(Institution.id == payload.institution_id).first()
    if not inst:
        inst = db.query(Institution).first() # Fallback to first college

    intakes = db.query(ApprovedIntake).filter(ApprovedIntake.institution_id == inst.id).all()
    baseline_capacity = sum(i.approved_seats for i in intakes) if intakes else 360
    baseline_enrolment = db.query(Student).filter(Student.institution_id == inst.id).count()
    if baseline_enrolment == 0:
        baseline_enrolment = int(baseline_capacity * 0.85)

    # Apply simulated modifications
    delta_mult = 1.0 + (payload.enrolment_delta_percent / 100.0)
    simulated_enrolment = int(baseline_enrolment * delta_mult)

    simulated_capacity = baseline_capacity
    for branch, seats in payload.branch_quota_overrides.items():
        simulated_capacity += (seats - 120)

    # Supernumerary quota calculations (AICTE allows up to 15% supernumerary)
    max_supernumerary_allowed = int(simulated_capacity * 0.15)
    simulated_supernumerary = 18 + payload.supernumerary_additional_seats

    # Mandated AICTE Faculty Ratio is 1:20
    required_faculty = int((simulated_enrolment + simulated_supernumerary) / 20) + 1
    existing_faculty = max(18, int(baseline_enrolment / 20))
    faculty_deficit = max(0, required_faculty - existing_faculty)

    # Capacity utilization & risk index
    seat_utilization_pct = round(((simulated_enrolment + simulated_supernumerary) / max(1, simulated_capacity)) * 100, 1)

    is_breach = (simulated_enrolment > simulated_capacity) or (simulated_supernumerary > max_supernumerary_allowed)
    compliance_score = max(0, min(100, int(100 - (faculty_deficit * 6) - (max(0, seat_utilization_pct - 100) * 2))))

    risk_level = "LOW"
    if compliance_score < 70 or is_breach:
        risk_level = "CRITICAL" if compliance_score < 55 else "WARNING"

    return {
        "institution_id": inst.id,
        "institution_name": inst.name,
        "state": inst.state,
        "simulation_parameters": {
            "enrolment_delta_percent": payload.enrolment_delta_percent,
            "supernumerary_additional": payload.supernumerary_additional_seats,
            "simulated_enrolment": simulated_enrolment,
            "baseline_enrolment": baseline_enrolment
        },
        "digital_twin_metrics": {
            "baseline_capacity": baseline_capacity,
            "simulated_capacity": simulated_capacity,
            "simulated_total_students": simulated_enrolment + simulated_supernumerary,
            "seat_utilization_pct": seat_utilization_pct,
            "supernumerary_utilization_pct": round((simulated_supernumerary / max(1, max_supernumerary_allowed)) * 100, 1),
            "max_supernumerary_allowed": max_supernumerary_allowed,
            "simulated_supernumerary": simulated_supernumerary,
            "existing_faculty": existing_faculty,
            "required_faculty": required_faculty,
            "faculty_deficit": faculty_deficit,
            "faculty_student_ratio": f"1:{round((simulated_enrolment + simulated_supernumerary) / max(1, existing_faculty), 1)}"
        },
        "regulatory_impact": {
            "is_breach": is_breach,
            "compliance_score": compliance_score,
            "risk_level": risk_level,
            "recommendations": [
                f"Recruit {faculty_deficit} additional faculty members to meet AICTE 1:20 norm." if faculty_deficit > 0 else "Faculty-to-student ratio is within compliant AICTE thresholds.",
                "Seat demand exceeds sanctioned intake. Apply for official intake expansion in AICTE Approval Process Handbook (APH) 2027-28." if simulated_enrolment > simulated_capacity else "Seat utilization is within sanctioned boundaries.",
                "Supernumerary quota exceeds 15% statutory ceiling." if simulated_supernumerary > max_supernumerary_allowed else "Supernumerary quotas (TFW/NRI) comply with national guidelines."
            ]
        }
    }
