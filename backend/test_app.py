import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_api():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        print("1. Health Status:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Super Admin Login
        login_res = client.post("/api/auth/login", json={"username_or_email": "aicte_admin", "password": "Aicte@2026"})
        print("2. Admin Login:", login_res.status_code, login_res.json())
        assert login_res.status_code == 200
        temp_token = login_res.json()["temp_session_token"]

        # 3. MFA Verify
        mfa_res = client.post("/api/auth/mfa/verify", json={"temp_session_token": temp_token, "otp_code": "123456"})
        print("3. MFA Verify:", mfa_res.status_code, mfa_res.json())
        assert mfa_res.status_code == 200
        access_token = mfa_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # 4. APAAR Sandbox Verification (Authenticated)
        verif = client.post("/api/apaar/verify", json={"apaar_id": "982345108742", "student_name": "Aarav Sharma"}, headers=headers)
        print("4. APAAR Verify:", verif.status_code, verif.json())
        assert verif.status_code == 200
        assert verif.json()["is_valid_format"] is True

        # 5. List Institutions
        inst_res = client.get("/api/institutions", headers=headers)
        print("5. Institutions Count:", len(inst_res.json()))
        assert len(inst_res.json()) >= 10

        # 6. Analytics Dashboard
        dash_res = client.get("/api/analytics/dashboard", headers=headers)
        print("6. Dashboard KPIs:", dash_res.json()["kpis"])
        assert dash_res.json()["kpis"]["total_students"] > 0

        # 7. Check Duplicates
        dupe_res = client.get("/api/duplicates", headers=headers)
        print("7. Duplicate Alerts Count:", len(dupe_res.json()))
        assert len(dupe_res.json()) > 0

        # 8. Check Offline Sync Push
        sync_payload = {
            "institution_id": "INST-AICTE-101",
            "batch_reference": "SYNC-TEST-BATCH-002",
            "records": [
                {
                    "client_temp_id": "LOCAL-TEMP-2",
                    "student_id": "TEST-OFFLINE-002",
                    "apaar_id": "123456789012",
                    "full_name": "Offline Synced Student 2",
                    "course": "Computer Science and Engineering",
                    "department": "CSE",
                    "academic_year": "2026-2027",
                    "admission_year": 2026,
                    "date_of_birth": "2005-05-15",
                    "gender": "Female",
                    "admission_category": "GENERAL",
                    "supernumerary_type": "NONE",
                    "nri_status": False,
                    "oci_status": False,
                    "foreign_national": False,
                    "client_timestamp": "2026-10-30T23:30:00Z"
                }
            ]
        }
        sync_res = client.post("/api/sync/push", json=sync_payload, headers=headers)
        print("8. Sync Push Result:", sync_res.status_code, sync_res.json())
        assert sync_res.status_code == 200

        # 9. Verify SPA index.html serving
        spa_res = client.get("/")
        print("9. SPA Frontend Index Status:", spa_res.status_code)
        assert spa_res.status_code == 200
        assert "APAAR ONE" in spa_res.text

        # 10. AICTE Copilot Natural Language Query
        copilot_res = client.post("/api/analytics/copilot", json={"query": "Find institutions exceeding approved intake"}, headers=headers)
        print("10. Copilot Response Status:", copilot_res.status_code)
        assert copilot_res.status_code == 200
        copilot_data = copilot_res.json()
        print("Copilot Summary:", copilot_data["summary"])
        assert "EXCESS_INTAKE" in copilot_data["intent"]

        # 11. Multi-Agent Intelligence System (15 Specialized Agents)
        agents_res = client.get("/api/agents", headers=headers)
        print("11. Agents Status Grid Count:", len(agents_res.json()))
        assert agents_res.status_code == 200
        assert len(agents_res.json()) == 15
        agent_names = [a["name"] for a in agents_res.json()]
        assert "Identity Intelligence Agent" in agent_names
        assert "Document Intelligence Agent" in agent_names
        assert "Policy Simulation Agent" in agent_names

        # 12. Academic Digital Twin Simulation Engine
        sim_res = client.post("/api/simulation/evaluate", json={
            "institution_id": "INST-AICTE-101",
            "enrolment_delta_percent": 15.0,
            "supernumerary_additional_seats": 5
        }, headers=headers)
        print("12. Simulation Evaluation Status:", sim_res.status_code)
        assert sim_res.status_code == 200
        sim_data = sim_res.json()
        print("Simulated Capacity:", sim_data["digital_twin_metrics"]["simulated_capacity"])
        assert "digital_twin_metrics" in sim_data
        assert "regulatory_impact" in sim_data

        # 13. Autonomous Workflow Engine
        wf_res = client.get("/api/workflows", headers=headers)
        print("13. Workflows Count:", len(wf_res.json()["workflows"]))
        assert wf_res.status_code == 200
        assert len(wf_res.json()["workflows"]) >= 2

        # 14. National Academic Identity Graph
        graph_res = client.get("/api/identity-graph", headers=headers)
        print("14. Identity Graph Nodes:", graph_res.json()["total_nodes"], "Edges:", graph_res.json()["total_edges"])
        assert graph_res.status_code == 200
        assert graph_res.json()["total_nodes"] > 0
        assert graph_res.json()["total_edges"] > 0

        # 15. Regulatory Case Management
        cases_res = client.get("/api/cases", headers=headers)
        print("15. Regulatory Cases Count:", len(cases_res.json()))
        assert cases_res.status_code == 200
        assert len(cases_res.json()) >= 3

        # 16. Document Intelligence Center
        doc_res = client.get("/api/documents", headers=headers)
        print("16. Processed Documents Count:", len(doc_res.json()))
        assert doc_res.status_code == 200
        assert len(doc_res.json()) >= 2

        # 17. National Policy Simulator
        pol_res = client.get("/api/policy-scenarios", headers=headers)
        print("17. Policy Scenarios Count:", len(pol_res.json()))
        assert pol_res.status_code == 200
        assert len(pol_res.json()) >= 2

        print("\n===============================================================================================")
        print("ALL 17 TESTS (APIs, ML, SYNC, SPA, COPILOT, 15-AGENTS, SIMULATION, WORKFLOWS, GRAPH, CASES) PASSED 100%!")
        print("===============================================================================================")

if __name__ == "__main__":
    test_api()
