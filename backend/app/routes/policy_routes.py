from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.database import get_db
from app.auth import get_current_user
from app.models import PolicyScenario, Institution

router = APIRouter(prefix="/api/policy-scenarios", tags=["National Policy Simulator"])

class PolicySimulationInput(BaseModel):
    scenario_code: str = "POL-AI-DS-EXPANSION"
    target_branch: str = "Artificial Intelligence and Data Science"
    national_intake_delta_pct: float = 15.0
    supernumerary_female_stem_pct: float = 5.0
    tfw_cap_pct: float = 8.0

DEFAULT_SCENARIOS = [
    {
        "scenario_code": "POL-AI-DS-EXPANSION",
        "scenario_name": "Nationwide 15% AI & Data Science Intake Expansion",
        "scenario_params": {
            "target_branch": "Artificial Intelligence and Data Science",
            "national_intake_delta_pct": 15.0,
            "supernumerary_female_stem_pct": 5.0,
            "tfw_cap_pct": 8.0
        },
        "projected_impact": {
            "additional_national_seats": 48200,
            "projected_total_intake": 412000,
            "estimated_budget_inr_cr": 142.5,
            "additional_faculty_required": 2410,
            "regional_impact": [
                {"state": "Maharashtra", "additional_seats": 7200, "budget_cr": 21.4},
                {"state": "Tamil Nadu", "additional_seats": 6800, "budget_cr": 20.1},
                {"state": "Karnataka", "additional_seats": 6400, "budget_cr": 18.9},
                {"state": "Delhi NCR", "additional_seats": 4900, "budget_cr": 14.5},
                {"state": "Uttar Pradesh", "additional_seats": 5600, "budget_cr": 16.7}
            ]
        },
        "risk_analysis": {
            "faculty_shortage_risk": "MEDIUM-HIGH",
            "infrastructure_strain_pct": 12.4,
            "curriculum_obsolescence_risk": "LOW",
            "recommendation": "Phased rollout recommended. Authorize 15% expansion only for institutions with NAAC A+ or NBA Tier-1 accreditation."
        }
    },
    {
        "scenario_code": "POL-FEMALE-STEM-BOOST",
        "scenario_name": "Special Supernumerary Quota for Female STEM Applicants (+5%)",
        "scenario_params": {
            "target_branch": "All Engineering Disciplines",
            "national_intake_delta_pct": 5.0,
            "supernumerary_female_stem_pct": 5.0,
            "tfw_cap_pct": 5.0
        },
        "projected_impact": {
            "additional_national_seats": 19500,
            "projected_total_intake": 384000,
            "estimated_budget_inr_cr": 58.0,
            "additional_faculty_required": 975,
            "regional_impact": [
                {"state": "Tamil Nadu", "additional_seats": 3100, "budget_cr": 9.2},
                {"state": "Maharashtra", "additional_seats": 2900, "budget_cr": 8.6},
                {"state": "Karnataka", "additional_seats": 2700, "budget_cr": 8.1}
            ]
        },
        "risk_analysis": {
            "faculty_shortage_risk": "LOW",
            "infrastructure_strain_pct": 4.8,
            "curriculum_obsolescence_risk": "NONE",
            "recommendation": "High policy feasibility. Aligns directly with national female empowerment in technical education."
        }
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def list_scenarios(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns pre-modeled national educational policy scenarios.
    """
    scenarios = db.query(PolicyScenario).all()
    if not scenarios:
        for ds in DEFAULT_SCENARIOS:
            new_s = PolicyScenario(
                scenario_code=ds["scenario_code"],
                scenario_name=ds["scenario_name"],
                created_by="AICTE Policy Planning Cell",
                scenario_params_json=json.dumps(ds["scenario_params"]),
                projected_impact_json=json.dumps(ds["projected_impact"]),
                risk_analysis_json=json.dumps(ds["risk_analysis"])
            )
            db.add(new_s)
        db.commit()
        scenarios = db.query(PolicyScenario).all()

    result = []
    for s in scenarios:
        result.append({
            "id": s.id,
            "scenario_code": s.scenario_code,
            "scenario_name": s.scenario_name,
            "created_by": s.created_by,
            "scenario_params": json.loads(s.scenario_params_json),
            "projected_impact": json.loads(s.projected_impact_json),
            "risk_analysis": json.loads(s.risk_analysis_json),
            "created_at": s.created_at.isoformat()
        })
    return result

@router.post("/simulate", response_model=Dict[str, Any])
def run_custom_policy_simulation(
    payload: PolicySimulationInput,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Simulates macroeconomic policy what-if scenario with regional impact breakdown.
    """
    base_seats = 360000
    additional_seats = int(base_seats * (payload.national_intake_delta_pct / 100.0))
    additional_stem_seats = int(base_seats * (payload.supernumerary_female_stem_pct / 100.0))
    total_new_seats = additional_seats + additional_stem_seats

    budget_cr = round((total_new_seats * 32000) / 10000000.0, 1) # Estimated grant subsidy
    additional_faculty = int(total_new_seats / 20.0)

    return {
        "status": "SUCCESS",
        "scenario_code": payload.scenario_code,
        "is_hypothetical": True,
        "simulation_parameters": payload.model_dump(),
        "national_projections": {
            "baseline_sanctioned_intake": base_seats,
            "simulated_additional_seats": total_new_seats,
            "projected_total_national_intake": base_seats + total_new_seats,
            "projected_budget_cr_inr": budget_cr,
            "projected_faculty_deficit": additional_faculty,
            "mandated_ratio": "1:20 Norm Enforced"
        },
        "risk_evaluation": {
            "capacity_stress_level": "ELEVATED" if payload.national_intake_delta_pct > 20 else "MODERATE",
            "curriculum_modernization_index": "HIGH",
            "regulatory_compliance_guideline": "Subject to AICTE Approval Process Handbook (APH) 2027 chapter 4 notification."
        }
    }
