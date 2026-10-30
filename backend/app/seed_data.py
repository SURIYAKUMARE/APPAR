import random
import hashlib
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import User, Institution, ApprovedIntake, Student, DuplicateAlert, AnomalyEvent, UserRole, VerificationStatus, AnomalySeverity, StudentConsent, VerificationRequest, AuditLog
from app.auth import hash_password, hash_apaar_id
from app.apaar_adapter import APAARNationalSandboxAdapter

INDIAN_FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Deepak", "Diya", "Ishaan", "Kavya", 
    "Meera", "Neha", "Nikhil", "Pranav", "Pooja", "Rahul", "Riya", "Rohan", 
    "Sanya", "Siddharth", "Sneha", "Tanvi", "Varun", "Vikas", "Yash", "Zoya",
    "Gaurav", "Harsh", "Karan", "Madhav", "Manish", "Priya", "Ritika", "Sameer",
    "Shreya", "Tanya", "Utkarsh", "Vaibhav", "Vidya", "Vivek", "Akash", "Bhavna"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Patel", "Reddy", "Nair", "Iyer", "Choudhury",
    "Singh", "Kumar", "Mishra", "Joshi", "Bose", "Chatterjee", "Kulkarni", "Deshmukh",
    "Bhat", "Rao", "Menon", "Pillai", "Agarwal", "Saxena", "Chauhan", "Yadav"
]

COURSES = [
    ("Computer Science and Engineering", "CSE", 120),
    ("Electronics and Communication Engineering", "ECE", 90),
    ("Mechanical Engineering", "MECH", 60),
    ("Artificial Intelligence and Data Science", "AIDS", 60),
    ("Information Technology", "IT", 60)
]

INSTITUTIONS_SEED = [
    {"id": "INST-AICTE-101", "aishe": "C-12001", "name": "Delhi Institute of Technology & Advanced Research", "state": "Delhi", "district": "New Delhi", "intake": 420},
    {"id": "INST-AICTE-102", "aishe": "C-24012", "name": "National College of Engineering & Technology", "state": "Tamil Nadu", "district": "Tiruchirappalli", "intake": 390},
    {"id": "INST-AICTE-103", "aishe": "C-31908", "name": "Maharashtra Institute of Science & Cybernetics", "state": "Maharashtra", "district": "Pune", "intake": 350},
    {"id": "INST-AICTE-104", "aishe": "C-45120", "name": "Karnataka Apex Academy of Engineering", "state": "Karnataka", "district": "Bengaluru Urban", "intake": 400},
    {"id": "INST-AICTE-105", "aishe": "C-56230", "name": "Bengal College of Technology & Informatics", "state": "West Bengal", "district": "Kolkata", "intake": 360},
    {"id": "INST-AICTE-106", "aishe": "C-67891", "name": "Telangana State Institute of Engineering", "state": "Telangana", "district": "Hyderabad", "intake": 390},
    {"id": "INST-AICTE-107", "aishe": "C-78902", "name": "Uttar Pradesh Technical Excellence Institute", "state": "Uttar Pradesh", "district": "Noida", "intake": 410},
    {"id": "INST-AICTE-108", "aishe": "C-89013", "name": "Gujarat Institute of Industrial Technology", "state": "Gujarat", "district": "Ahmedabad", "intake": 380},
    {"id": "INST-AICTE-109", "aishe": "C-90124", "name": "Punjab Academy of Advanced Polytechnic", "state": "Punjab", "district": "Ludhiana", "intake": 340},
    {"id": "INST-AICTE-110", "aishe": "C-99235", "name": "Kerala Model Engineering & Innovation Centre", "state": "Kerala", "district": "Kochi", "intake": 370}
]

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Institution).count() > 0:
        return

    print("Seeding APAAR ONE database with realistic national dataset (AICTE SIH 2026)...")

    # 1. Create Core Users with realistic enterprise credentials
    users_data = [
        {"username": "aicte_admin", "email": "admin@aicte-india.org", "role": UserRole.SUPER_ADMIN.value, "name": "Dr. Anil Sahasrabudhe (AICTE HQ)", "inst_id": None},
        {"username": "regulation_officer", "email": "regulation@aicte-india.org", "role": UserRole.REGULATION_OFFICER.value, "name": "Smt. Mamta Rani (Bureau Chief)", "inst_id": None},
        {"username": "state_nodal_dl", "email": "nodal.delhi@aicte-india.org", "role": UserRole.STATE_NODAL_OFFICER.value, "name": "Shri Rajesh Mehra (State Nodal Officer - Delhi)", "inst_id": None, "state": "Delhi"},
        {"username": "inst_admin_101", "email": "registrar@ditar.edu.in", "role": UserRole.INSTITUTION_ADMIN.value, "name": "Prof. S. K. Narayanan (Registrar)", "inst_id": "INST-AICTE-101"},
        {"username": "admission_officer_101", "email": "admissions@ditar.edu.in", "role": UserRole.ADMISSION_OFFICER.value, "name": "Dr. Ritu Saxena (Dean Admissions)", "inst_id": "INST-AICTE-101"},
        {"username": "student_demo", "email": "aarav.sharma2026@student.edu.in", "role": UserRole.STUDENT.value, "name": "Aarav Sharma", "inst_id": "INST-AICTE-101"},
        {"username": "tcs_verifier", "email": "bgv.desk@tcs-enterprise.com", "role": UserRole.EXTERNAL_VERIFIER.value, "name": "Vikram Sen (Senior BGV Specialist)", "inst_id": None},
        {"username": "aicte_auditor", "email": "cag.auditor@gov.in", "role": UserRole.AUDITOR.value, "name": "Sunil Kaushik (CAG Principal Auditor)", "inst_id": None}
    ]

    for u in users_data:
        user = User(
            username=u["username"],
            email=u["email"],
            full_name=u["name"],
            hashed_password=hash_password("Aicte@2026"),
            role=u["role"],
            institution_id=u.get("inst_id"),
            state=u.get("state"),
            is_active=True,
            mfa_enabled=True,
            totp_secret="JBSWY3DPEHPK3PXP" # Base32 demo secret
        )
        db.add(user)

    # 2. Seed 10 Institutions
    for inst_info in INSTITUTIONS_SEED:
        inst = Institution(
            id=inst_info["id"],
            aishe_code=inst_info["aishe"],
            name=inst_info["name"],
            state=inst_info["state"],
            district=inst_info["district"],
            category="AICTE Approved Autonomous / Affiliated Technical Institute",
            status="APPROVED",
            compliance_score=round(random.uniform(92.0, 99.5), 1),
            total_approved_intake=inst_info["intake"],
            contact_email=f"registrar@{inst_info['id'].lower().replace('-', '')}.gov.in"
        )
        db.add(inst)
        db.flush()

        # Seed approved intake per course
        for course_name, dept_code, seats in COURSES:
            app_intake = ApprovedIntake(
                institution_id=inst.id,
                course_name=course_name,
                academic_year="2026-2027",
                approved_seats=seats,
                supernumerary_quota=int(seats * 0.15) # 15% supernumerary quota cap
            )
            db.add(app_intake)

    db.commit()

    # 3. Seed ~1,000 Synthetic Student Records across 10 institutions
    # We will distribute ~100 students per institution
    total_target = 1000
    student_records = []
    student_counter = 1

    # Keep a few reserved APAAR IDs to create deliberate duplicate scenarios
    duplicate_apaar_1 = "982345108742"
    duplicate_apaar_2 = "871234905621"

    for inst_idx, inst_info in enumerate(INSTITUTIONS_SEED):
        inst_id = inst_info["id"]
        # Special scenario for INST-AICTE-107: Deliberate Excess Intake in CSE
        # CSE intake is 120, we will insert 132 students to demonstrate excess intake anomaly!
        students_for_this_inst = 112 if inst_id == "INST-AICTE-107" else 98

        for s_idx in range(students_for_this_inst):
            first = random.choice(INDIAN_FIRST_NAMES)
            last = random.choice(INDIAN_LAST_NAMES)
            full_name = f"{first} {last}"
            
            # Select course
            if inst_id == "INST-AICTE-107" and s_idx < 132:
                course_tuple = COURSES[0] # All CSE for excess intake trigger
            else:
                course_tuple = random.choice(COURSES)
                
            course_name, dept_code, _ = course_tuple

            # APAAR ID Generation (12 digits)
            if s_idx == 10 and inst_idx == 0:
                apaar_num = duplicate_apaar_1
            elif s_idx == 10 and inst_idx == 1:
                apaar_num = duplicate_apaar_1 # Cross-institution collision!
            elif s_idx == 20 and inst_idx == 2:
                apaar_num = duplicate_apaar_2
            elif s_idx == 20 and inst_idx == 3:
                apaar_num = duplicate_apaar_2 # Cross-institution collision!
            else:
                apaar_num = f"{random.randint(1000, 9999)}{random.randint(1000, 9999)}{random.randint(1000, 9999)}"

            # Quotas and Categories
            cat_rand = random.random()
            if cat_rand < 0.50:
                category = "GENERAL"
            elif cat_rand < 0.75:
                category = "OBC"
            elif cat_rand < 0.90:
                category = "SC"
            else:
                category = "ST"

            super_rand = random.random()
            if super_rand < 0.85:
                supernumerary = "NONE"
            elif super_rand < 0.92:
                supernumerary = "TFW" # Tuition Fee Waiver
            elif super_rand < 0.97:
                supernumerary = "PMSSS" # Prime Minister's Special Scholarship Scheme
            else:
                supernumerary = "DEFENSE"

            nri = (random.random() < 0.03)
            oci = (random.random() < 0.01)
            fn = (random.random() < 0.01)

            # Verification Status (90% verified, 8% pending, 2% flagged)
            stat_rand = random.random()
            if apaar_num in [duplicate_apaar_1, duplicate_apaar_2]:
                v_status = VerificationStatus.FLAGGED.value
            elif stat_rand < 0.88:
                v_status = VerificationStatus.VERIFIED.value
            else:
                v_status = VerificationStatus.PENDING.value

            roll_no = f"{inst_id.split('-')[-1]}-{dept_code}-2026-{s_idx + 1:04d}"
            dob_year = random.randint(2003, 2006)
            dob_month = random.randint(1, 12)
            dob_day = random.randint(1, 28)
            dob_str = f"{dob_year:04d}-{dob_month:02d}-{dob_day:02d}"

            student = Student(
                student_id=roll_no,
                apaar_id=apaar_num,
                apaar_hash=hash_apaar_id(apaar_num),
                full_name=full_name,
                institution_id=inst_id,
                course=course_name,
                department=dept_code,
                academic_year="2026-2027",
                admission_year=2026,
                date_of_birth=dob_str,
                gender=random.choice(["Male", "Female"]),
                admission_category=category,
                supernumerary_type=supernumerary,
                nri_status=nri,
                oci_status=oci,
                foreign_national=fn,
                enrollment_status="ACTIVE",
                verification_status=v_status,
                verification_notes="Demo synthetic student profile - AICTE Central Validation System",
                is_offline_provisional=False
            )
            db.add(student)
            student_counter += 1

    db.commit()

    # 4. Generate Pre-built Duplicate Alerts
    dupe_students = db.query(Student).filter(Student.apaar_id == duplicate_apaar_1).all()
    if len(dupe_students) >= 2:
        s1, s2 = dupe_students[0], dupe_students[1]
        alert = DuplicateAlert(
            duplicate_type="CROSS_INSTITUTION_APAAR",
            severity=AnomalySeverity.CRITICAL.value,
            risk_score=96.4,
            student_id=s1.id,
            conflicting_student_id=s2.id,
            conflicting_institution_id=s2.institution_id,
            description=f"CRITICAL: Student APAAR '{duplicate_apaar_1}' is registered simultaneously at '{s1.institution_id}' and '{s2.institution_id}'. Potential dual regular technical admission breach.",
            status="UNDER_REVIEW",
            assigned_officer="AICTE Regulation Bureau"
        )
        db.add(alert)

    # 5. Generate Anomaly Events (Excess Intake on INST-AICTE-107)
    inst_107 = db.query(Institution).filter(Institution.id == "INST-AICTE-107").first()
    if inst_107:
        anomaly = AnomalyEvent(
            institution_id="INST-AICTE-107",
            event_type="EXCESS_INTAKE_BREACH",
            risk_score=88.7,
            severity=AnomalySeverity.HIGH.value,
            reason="Actual enrolment in B.Tech CSE (132 students) exceeds AICTE Approved Intake limit (120 seats) by 10%.",
            recommended_action="Issue formal notice under AICTE Approval Process Handbook Clause 7.2; verify supernumerary approvals.",
            status="OPEN",
            assigned_officer="Regulation Bureau Officer (Zone North)"
        )
        db.add(anomaly)
        inst_107.compliance_score = 78.4
        inst_107.status = "AUDIT_FLAGGED"

    # 6. Seed Demo Consent & Verification Request
    sample_student = db.query(Student).filter(Student.student_id.like("%CSE%")).first()
    if sample_student:
        consent = StudentConsent(
            student_id=sample_student.id,
            verifier_org="Tata Consultancy Services Ltd. (Background Verification Desk)",
            purpose="Employment Pre-boarding Credential Check",
            shared_fields="name,course,institution,enrollment_status,academic_year",
            status="ACTIVE",
            expires_at=datetime.now(timezone.utc) + timedelta(days=90)
        )
        db.add(consent)

        v_req = VerificationRequest(
            qr_reference=f"VR-2026-{random.randint(100000, 999999)}",
            student_id=sample_student.id,
            verifier_org="Tata Consultancy Services Ltd.",
            verifier_role="Employer / Third-Party Verifier",
            purpose="Employment Verification",
            status="CONSENT_GRANTED",
            digital_signature="DIGISIGN_AICTE_78F9B2C1A0E44D318C",
            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        db.add(v_req)

    # 7. Seed Initial Immutable Audit Logs
    audit1 = AuditLog(
        actor_username="aicte_admin",
        actor_role="SUPER_ADMIN",
        action="SYSTEM_INITIALIZATION",
        resource_type="CENTRAL_REGISTRY",
        resource_id="ALL",
        details="Platform seeded with 10 institutions and 1,000 synthetic student records. All records marked DEMO DATA.",
        ip_address="10.0.1.5",
        tamper_hash=hashlib.sha256("INITIAL_GENESIS_BLOCK_AICTE_APAAR_ONE_2026".encode('utf-8')).hexdigest()
    )
    db.add(audit1)

    db.commit()
    print("Database seeding completed successfully.")
