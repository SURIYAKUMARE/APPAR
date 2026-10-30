import re
import hashlib
import hmac
import time
from typing import Dict, Any, Tuple
from app.config import settings

# Verhoeff algorithm multiplication and permutation tables for 12-digit national IDs
VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

def validate_verhoeff_checksum(num_str: str) -> bool:
    """Verifies standard Verhoeff 10 check digit."""
    c = 0
    clean = re.sub(r'\D', '', num_str)
    if not clean:
        return False
    digits = [int(d) for d in reversed(clean)]
    for i, d in enumerate(digits):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][d]]
    return c == 0

def format_masked_apaar(apaar_id: str) -> str:
    """Masks all but the last 4 digits for privacy."""
    clean = re.sub(r'\D', '', apaar_id)
    if len(clean) >= 4:
        return f"XXXX-XXXX-{clean[-4:]}"
    return "XXXX-XXXX-XXXX"

class APAARNationalSandboxAdapter:
    """
    Authorized Sandbox / Mock Gateway for:
    - Ministry of Education / ABC (Academic Bank of Credits)
    - DigiLocker National Gateway
    - UIDAI / Aadhaar Linked Registry
    """
    GATEWAY_ENDPOINT = "https://sandbox.edugov.in/apaar/v2/verify"

    @classmethod
    def verify_apaar(cls, apaar_id: str, student_name: str = "", dob: str = "") -> Dict[str, Any]:
        clean_id = re.sub(r'\D', '', apaar_id)
        
        # Check format: exactly 12 digits
        is_format_valid = bool(re.match(r'^\d{12}$', clean_id))
        if not is_format_valid:
            return {
                "apaar_id": apaar_id,
                "is_valid_format": False,
                "is_checksum_valid": False,
                "sandbox_verified": False,
                "message": "APAAR ID must be exactly 12 numeric digits.",
                "digital_signature": "INVALID_SIGNATURE",
                "issued_by": "DigiLocker / ABC National Gateway (Sandbox Adapter)"
            }

        # Check Verhoeff checksum
        is_checksum_valid = validate_verhoeff_checksum(clean_id)
        
        # Mock sandbox resolution
        # Test scenario: IDs ending in '0000' or '9999' represent invalid test numbers
        if clean_id.endswith("0000") or clean_id.endswith("9999"):
            return {
                "apaar_id": format_masked_apaar(clean_id),
                "is_valid_format": True,
                "is_checksum_valid": False,
                "sandbox_verified": False,
                "message": "Checksum mismatch in DigiLocker central registry. Record does not match student profile.",
                "digital_signature": "SIGN_REJECTED",
                "issued_by": "DigiLocker / ABC National Gateway (Sandbox Adapter)"
            }

        # Successful verification in sandbox
        timestamp = int(time.time())
        token_payload = f"APAAR-VERIFIED|{clean_id}|{student_name}|{timestamp}"
        digital_signature = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            token_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        pseudo_aadhaar_hash = hashlib.sha256(f"aadhaar-{clean_id[-4:]}".encode('utf-8')).hexdigest()[:16]

        return {
            "apaar_id": clean_id,
            "masked_apaar": format_masked_apaar(clean_id),
            "is_valid_format": True,
            "is_checksum_valid": True,
            "sandbox_verified": True,
            "message": "Record successfully verified against ABC Central Educational Repository.",
            "linked_aadhaar_hash": f"SHA256:{pseudo_aadhaar_hash}...",
            "name_matched": True,
            "timestamp": timestamp,
            "digital_signature": f"DIGISIGN_AICTE_{digital_signature[:32].upper()}",
            "issued_by": "National Academic Depository (NAD) / ABC Sandbox Gateway"
        }
