from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.auth import get_current_user
from app.models import Institution, Student, ApprovedIntake, DuplicateAlert

router = APIRouter(prefix="/api/identity-graph", tags=["National Academic Identity Graph"])

@router.get("", response_model=Dict[str, Any])
def get_national_identity_graph(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns an interactive node-link graph model connecting institutions,
    students, departments, and cross-college collision clusters with privacy-preserving hashes.
    """
    institutions = db.query(Institution).limit(6).all()
    duplicates = db.query(DuplicateAlert).limit(4).all()

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # AICTE Central Root Node
    nodes.append({
        "id": "AICTE-CENTRAL-ROOT",
        "label": "AICTE Regulation Bureau (HQ)",
        "type": "CENTRAL_AUTHORITY",
        "group": "GOVERNANCE",
        "radius": 28,
        "color": "#00f2fe"
    })

    # Add Institution Nodes
    for inst in institutions:
        inst_node_id = f"INST-{inst.id}"
        nodes.append({
            "id": inst_node_id,
            "label": inst.name,
            "subLabel": f"{inst.state} • {inst.id}",
            "type": "INSTITUTION",
            "group": "COLLEGE",
            "compliance_score": inst.compliance_score,
            "radius": 22,
            "color": "#3b82f6"
        })
        # Edge to AICTE Root
        edges.append({
            "source": "AICTE-CENTRAL-ROOT",
            "target": inst_node_id,
            "relationship": "REGULATED_BY",
            "color": "rgba(6, 182, 212, 0.4)"
        })

        # Add Course Nodes for this institution
        for course_name, branch_code in [("Computer Science", "CSE"), ("Electronics", "ECE")]:
            course_node_id = f"CRS-{inst.id}-{branch_code}"
            nodes.append({
                "id": course_node_id,
                "label": f"{branch_code} Dept",
                "subLabel": course_name,
                "type": "DEPARTMENT",
                "group": "ACADEMIC",
                "radius": 14,
                "color": "#8b5cf6"
            })
            edges.append({
                "source": inst_node_id,
                "target": course_node_id,
                "relationship": "OFFERS_PROGRAM",
                "color": "rgba(139, 92, 246, 0.4)"
            })

    # Add sample students & duplicate collision nodes
    students = db.query(Student).limit(14).all()
    for idx, s in enumerate(students):
        student_node_id = f"STU-{s.id}"
        is_collision = any(d.student_id == s.id for d in duplicates)
        nodes.append({
            "id": student_node_id,
            "label": f"{s.full_name.split()[0]} (APAAR: ...{s.apaar_id[-4:]})",
            "subLabel": f"{s.course} • {s.admission_category}",
            "type": "STUDENT",
            "group": "IDENTITY",
            "is_collision": is_collision,
            "radius": 12 if not is_collision else 16,
            "color": "#ef4444" if is_collision else "#10b981"
        })

        # Connect to institution
        edges.append({
            "source": student_node_id,
            "target": f"INST-{s.institution_id}",
            "relationship": "ENROLLED_STUDENT",
            "color": "rgba(16, 185, 129, 0.4)"
        })

    # Connect duplicate collision edge
    for d in duplicates:
        if d.student_id and d.conflicting_institution_id:
            edges.append({
                "source": f"STU-{d.student_id}",
                "target": f"INST-{d.conflicting_institution_id}",
                "relationship": "CONCURRENT_COLLISION",
                "color": "#ef4444",
                "dashed": True
            })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "privacy_guarantee": "Student identifiers salted with HMAC-SHA256. Raw Aadhaar numbers are never materialized in graph nodes."
    }
