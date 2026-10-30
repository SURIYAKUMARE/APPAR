import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import Student, ApprovedIntake, DuplicateAlert, AnomalyEvent, AnomalySeverity, VerificationStatus
from app.auth import hash_apaar_id

class IntelligentValidationEngine:
    """
    Automated Multi-Layer Validation Engine combining:
    1. Deterministic AICTE Handbook Regulatory Rule Checks
    2. Privacy-preserving Duplicate Detection
    3. Scikit-Learn Isolation Forest Anomaly Scoring
    4. Human-In-The-Loop Triage Assignment
    """

    def __init__(self):
        # Isolation Forest model initialized for batch pattern anomaly scoring
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        self._is_fitted = False

    def check_student_duplicates(self, db: Session, student_id_str: str, apaar_id_str: str, institution_id: str) -> List[Dict[str, Any]]:
        """
        Cross-institution duplicate detection using privacy-preserving APAAR hash
        and institutional student ID checks.
        """
        duplicates_found = []
        apaar_hash = hash_apaar_id(apaar_id_str)

        # 1. Cross-institution duplicate APAAR ID
        cross_records = db.query(Student).filter(
            Student.apaar_hash == apaar_hash,
            Student.institution_id != institution_id
        ).all()

        for rec in cross_records:
            duplicates_found.append({
                "duplicate_type": "CROSS_INSTITUTION_APAAR",
                "severity": AnomalySeverity.CRITICAL.value,
                "risk_score": 95.0,
                "conflicting_student_id": rec.id,
                "conflicting_institution_id": rec.institution_id,
                "description": f"Concurrent active enrolment detected: Student APAAR ID is already enrolled at Institution '{rec.institution_id}' ({rec.course}). Dual regular full-time technical enrolment violates AICTE norms."
            })

        # 2. Same-institution duplicate APAAR ID
        same_inst_records = db.query(Student).filter(
            Student.apaar_hash == apaar_hash,
            Student.institution_id == institution_id
        ).all()

        if len(same_inst_records) > 0:
            for rec in same_inst_records:
                duplicates_found.append({
                    "duplicate_type": "REPEAT_ENROLMENT",
                    "severity": AnomalySeverity.HIGH.value,
                    "risk_score": 85.0,
                    "conflicting_student_id": rec.id,
                    "conflicting_institution_id": institution_id,
                    "description": f"Duplicate student APAAR already exists in Institution '{institution_id}' under Student ID '{rec.student_id}'."
                })

        # 3. Student ID collision within institution
        same_id_records = db.query(Student).filter(
            Student.student_id == student_id_str,
            Student.institution_id == institution_id
        ).all()

        if len(same_id_records) > 0:
            duplicates_found.append({
                "duplicate_type": "STUDENT_ID_COLLISION",
                "severity": AnomalySeverity.MEDIUM.value,
                "risk_score": 65.0,
                "conflicting_student_id": same_id_records[0].id,
                "conflicting_institution_id": institution_id,
                "description": f"Student Roll / Reg ID '{student_id_str}' is already assigned to another student record in this institution."
            })

        return duplicates_found

    def check_admission_compliance(self, db: Session, institution_id: str, course_name: str, academic_year: str = "2026-2027") -> Dict[str, Any]:
        """
        Validates actual enrolment vs approved intake and supernumerary caps.
        """
        approved = db.query(ApprovedIntake).filter(
            ApprovedIntake.institution_id == institution_id,
            ApprovedIntake.course_name == course_name,
            ApprovedIntake.academic_year == academic_year
        ).first()

        if not approved:
            return {
                "compliant": False,
                "approved_intake": 0,
                "actual_enrolment": 0,
                "excess": 0,
                "supernumerary_count": 0,
                "supernumerary_quota": 0,
                "reason": f"No AICTE approved intake found for {course_name} in academic year {academic_year}."
            }

        # Count current students enrolled in this course & academic year
        actual_students = db.query(Student).filter(
            Student.institution_id == institution_id,
            Student.course == course_name,
            Student.academic_year == academic_year
        ).all()

        regular_count = sum(1 for s in actual_students if s.supernumerary_type == "NONE")
        supernumerary_count = sum(1 for s in actual_students if s.supernumerary_type != "NONE")
        total_enrolment = len(actual_students)

        is_excess_regular = regular_count > approved.approved_seats
        is_excess_supernumerary = supernumerary_count > approved.supernumerary_quota
        compliant = not (is_excess_regular or is_excess_supernumerary)

        excess_regular = max(0, regular_count - approved.approved_seats)
        excess_supernumerary = max(0, supernumerary_count - approved.supernumerary_quota)

        return {
            "compliant": compliant,
            "approved_intake": approved.approved_seats,
            "actual_enrolment": total_enrolment,
            "regular_count": regular_count,
            "excess_regular": excess_regular,
            "supernumerary_count": supernumerary_count,
            "supernumerary_quota": approved.supernumerary_quota,
            "excess_supernumerary": excess_supernumerary,
            "has_violations": (excess_regular > 0 or excess_supernumerary > 0)
        }

    def run_ml_anomaly_detection(self, institution_features: List[List[float]]) -> List[Dict[str, Any]]:
        """
        Evaluates institution intake metrics using Scikit-Learn Isolation Forest.
        Features per institution: [approved_intake, actual_enrolment, supernumerary_ratio, nri_ratio, unverified_apaar_ratio]
        """
        if len(institution_features) < 4:
            # Baseline rule fallback if dataset is very small
            results = []
            for feat in institution_features:
                approved, actual, super_ratio, nri_ratio, unverified_ratio = feat
                is_anomaly = (actual > approved * 1.1) or (super_ratio > 0.25) or (unverified_ratio > 0.4)
                score = 82.5 if is_anomaly else 20.0
                results.append({
                    "is_anomaly": is_anomaly,
                    "risk_score": score,
                    "severity": AnomalySeverity.HIGH.value if is_anomaly else AnomalySeverity.LOW.value
                })
            return results

        X = np.array(institution_features)
        self.iso_forest.fit(X)
        preds = self.iso_forest.predict(X) # -1 for anomaly, 1 for normal
        scores = self.iso_forest.score_samples(X) # lower score means higher anomaly

        # Normalize score to 0 - 100 risk score
        min_s = float(np.min(scores))
        max_s = float(np.max(scores))
        diff = max_s - min_s if max_s != min_s else 1.0

        evaluations = []
        for i, pred in enumerate(preds):
            norm_risk = float(100.0 * (1.0 - (scores[i] - min_s) / diff))
            is_anomaly = bool(pred == -1 or norm_risk > 65.0)
            severity = AnomalySeverity.CRITICAL.value if norm_risk > 80 else (AnomalySeverity.HIGH.value if norm_risk > 60 else AnomalySeverity.LOW.value)
            evaluations.append({
                "is_anomaly": is_anomaly,
                "risk_score": round(norm_risk, 1),
                "severity": severity
            })

        return evaluations

validation_engine = IntelligentValidationEngine()
