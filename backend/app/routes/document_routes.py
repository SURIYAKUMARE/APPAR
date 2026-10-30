from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.database import get_db
from app.auth import get_current_user
from app.models import DocumentJob

router = APIRouter(prefix="/api/documents", tags=["Document Intelligence Center"])

class DocumentCorrectionRequest(BaseModel):
    corrected_fields: Dict[str, Any]
    officer_verification_notes: str = ""

DEFAULT_DOCUMENTS = [
    {
        "filename": "AICTE_APPROVAL_SANCTION_2026_INST101.pdf",
        "file_type": "PDF",
        "uploaded_by": "registrar@ditar.edu.in",
        "status": "VERIFIED",
        "confidence_score": 99.4,
        "extracted_fields": {
            "institution_name": "Delhi Institute of Technology & Advanced Research",
            "approval_id": "AICTE/NORTH/1-12001/2026",
            "sanctioned_courses": [
                {"branch": "Computer Science and Engineering", "intake": 120, "confidence": 0.99},
                {"branch": "Electronics and Communication", "intake": 90, "confidence": 0.99},
                {"branch": "Mechanical Engineering", "intake": 60, "confidence": 0.98}
            ],
            "statutory_faculty_mandate": "1:20 Undergraduate Norm",
            "supernumerary_ceiling": "15% Maximum",
            "official_seal_verified": True
        }
    },
    {
        "filename": "ADMISSION_REGISTRATION_BATCH_MECH_04.pdf",
        "file_type": "PDF",
        "uploaded_by": "admissions@ditar.edu.in",
        "status": "EXTRACTION_COMPLETE",
        "confidence_score": 98.1,
        "extracted_fields": {
            "batch_title": "B.Tech Mechanical Engineering Batch 2026",
            "total_students_extracted": 58,
            "apaar_ids_identified": 58,
            "verhoeff_checksum_pass_rate": "100%",
            "quota_breakdown": {
                "GENERAL": 32,
                "OBC_NCL": 14,
                "SC_ST": 9,
                "EWS": 3
            },
            "anomalies_flagged": 0
        }
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def list_documents(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns history of processed documents, OCR confidence scores, and extracted tables.
    """
    docs = db.query(DocumentJob).order_by(DocumentJob.id.desc()).all()
    if not docs:
        for dd in DEFAULT_DOCUMENTS:
            new_doc = DocumentJob(
                filename=dd["filename"],
                file_type=dd["file_type"],
                uploaded_by=dd["uploaded_by"],
                status=dd["status"],
                confidence_score=dd["confidence_score"],
                extracted_fields_json=json.dumps(dd["extracted_fields"])
            )
            db.add(new_doc)
        db.commit()
        docs = db.query(DocumentJob).all()

    result = []
    for d in docs:
        result.append({
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "uploaded_by": d.uploaded_by,
            "status": d.status,
            "confidence_score": d.confidence_score,
            "extracted_fields": json.loads(d.extracted_fields_json) if d.extracted_fields_json else {},
            "created_at": d.created_at.isoformat()
        })
    return result

@router.post("/extract-sample", response_model=Dict[str, Any])
def extract_sample_document(
    sample_type: str = "AICTE_APPROVAL_LETTER",
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Simulates high-precision OCR table extraction with bounding boxes and Verhoeff validation.
    """
    doc = DocumentJob(
        filename=f"SAMPLE_{sample_type}_AICTE_2026.pdf",
        file_type="PDF",
        uploaded_by=current_user.get("sub", "officer"),
        status="EXTRACTION_COMPLETE",
        confidence_score=98.8,
        extracted_fields_json=json.dumps({
            "document_type": sample_type,
            "extracted_apaar_id": "982345108742",
            "verhoeff_valid": True,
            "student_name": "Aarav Sharma",
            "sanctioned_branch": "Computer Science and Engineering",
            "admission_quota": "GENERAL",
            "bounding_boxes": [
                {"field": "APAAR_ID", "box": [120, 45, 260, 68], "confidence": 0.99},
                {"field": "STUDENT_NAME", "box": [120, 85, 340, 108], "confidence": 0.98},
                {"field": "COURSE", "box": [120, 125, 410, 148], "confidence": 0.99}
            ]
        })
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "status": "SUCCESS",
        "document_id": doc.id,
        "filename": doc.filename,
        "confidence_score": doc.confidence_score,
        "extracted_data": json.loads(doc.extracted_fields_json),
        "message": "OCR document intelligence extraction complete with 98.8% confidence."
    }
