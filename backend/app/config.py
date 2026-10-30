import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "APAAR ONE"
    PROJECT_SUBTITLE: str = "National APAAR-Based Student Data Management, Verification & Intelligence Platform"
    AICTE_PORTAL_VERSION: str = "2.6.3-PROD"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aicte-apaar-one-national-super-secure-key-2026-sih")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./apaar_one.db")
    HMAC_SALT: str = os.getenv("HMAC_SALT", "apaar-privacy-preserving-salt-2026")
    DEMO_MODE: bool = True
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    class Config:
        env_file = ".env"

settings = Settings()
