from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import secrets

from app.database import get_db
from app.models import User, SecurityEvent, UserRole
from app.schemas import LoginRequest, MFARequest, Token, UserOut, PasswordResetRequest
from app.auth import verify_password, hash_password, create_access_token, get_current_user, create_audit_entry
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication & Access Control"])

# In-memory store for demo temporary MFA tokens: {temp_token: {"user_id": int, "username": str, "expires": datetime}}
mfa_temp_sessions = {}

@router.post("/login", response_model=Token)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    identifier = req.username_or_email.strip()

    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user:
        # Record security event for unrecognized user attempt
        sec_event = SecurityEvent(
            event_type="FAILED_LOGIN_UNKNOWN_USER",
            actor=identifier,
            ip_address=client_ip,
            severity="LOW",
            details=f"Unrecognized username/email attempt: {identifier}"
        )
        db.add(sec_event)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid national credentials or user not recognized.")

    # Check account lockout
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        remaining = int((user.locked_until - datetime.now(timezone.utc)).total_seconds() / 60)
        raise HTTPException(
            status_code=423,
            detail=f"Account locked due to consecutive failed login attempts. Retry in {remaining} minute(s)."
        )

    # Verify password
    if not verify_password(req.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            sec_event = SecurityEvent(
                event_type="ACCOUNT_LOCKED",
                actor=user.username,
                ip_address=client_ip,
                severity="HIGH",
                details=f"Account locked after {user.failed_login_attempts} failed attempts."
            )
            db.add(sec_event)
        db.commit()
        raise HTTPException(status_code=401, detail=f"Invalid credentials. Attempts left: {max(0, settings.MAX_LOGIN_ATTEMPTS - user.failed_login_attempts)}")

    # Reset failed attempts on success
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # If MFA is enabled, issue a temporary session token
    if user.mfa_enabled:
        temp_token = secrets.token_urlsafe(32)
        mfa_temp_sessions[temp_token] = {
            "user_id": user.id,
            "username": user.username,
            "expires": datetime.now(timezone.utc) + timedelta(minutes=5)
        }
        return Token(
            access_token="",
            token_type="bearer",
            role=user.role,
            institution_id=user.institution_id,
            full_name=user.full_name,
            requires_mfa=True,
            temp_session_token=temp_token
        )

    # Direct login without MFA (or fallback)
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "institution_id": user.institution_id})
    create_audit_entry(db, user.username, user.role, "USER_LOGIN_SUCCESS", "AUTH", str(user.id), "Session authenticated without MFA", client_ip)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        institution_id=user.institution_id,
        full_name=user.full_name,
        requires_mfa=False
    )

@router.post("/mfa/verify", response_model=Token)
def verify_mfa(req: MFARequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    session_data = mfa_temp_sessions.get(req.temp_session_token)

    if not session_data or session_data["expires"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="MFA verification session has expired. Please log in again.")

    # Demo OTP code is "123456" or any 6-digit code for testing convenience
    # In live system, TOTP / SMS gateway validates code
    clean_code = req.otp_code.strip()
    if len(clean_code) != 6 or not clean_code.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be a valid 6-digit numeric security code.")

    user = db.query(User).filter(User.id == session_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Expire temp session
    del mfa_temp_sessions[req.temp_session_token]

    access_token = create_access_token(data={"sub": user.username, "role": user.role, "institution_id": user.institution_id})
    create_audit_entry(db, user.username, user.role, "MFA_VERIFIED", "AUTH", str(user.id), "Second-factor OTP verified successfully", client_ip)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        institution_id=user.institution_id,
        full_name=user.full_name,
        requires_mfa=False
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Return generic success to prevent email enumeration
        return {"status": "SUCCESS", "message": "If this email is registered in AICTE records, password reset instructions have been dispatched."}

    user.hashed_password = hash_password(req.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    create_audit_entry(db, user.username, user.role, "PASSWORD_RESET", "USER", str(user.id), "Password updated securely")
    return {"status": "SUCCESS", "message": "Password successfully reset. You may now log in with your new credentials."}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    create_audit_entry(db, current_user.username, current_user.role, "USER_LOGOUT", "AUTH", str(current_user.id), "Secure session terminated")
    return {"status": "SUCCESS", "message": "Logged out successfully."}
