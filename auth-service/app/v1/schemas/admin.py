"""
Admin schemas for the auth-service.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class UserAdminRead(BaseModel):
    """User as seen by admin — includes status fields."""
    id: uuid.UUID
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    is_locked: bool
    created_at: Optional[datetime] = None

    @property
    def status(self) -> str:
        if not self.is_active or self.is_locked:
            return "suspended"
        if not self.is_verified:
            return "pending"
        return "active"

    model_config = {"from_attributes": True}


class AdminUserListResponse(BaseModel):
    items: list[UserAdminRead]
    total: int
    page: int
    size: int
    counts: dict  # {"total": N, "active": N, "suspended": N, "pending": N}


class UserStatusUpdate(BaseModel):
    """Payload to change a user's status."""
    action: str   # "suspend" | "activate" | "validate"


# Platform settings — stored as a simple in-memory config for now
# (can be persisted to DB later)
class PlatformSettings(BaseModel):
    school_name: str = "VoteÉtudiant"
    school_email_domain: str = "ecole.fr"
    max_election_duration_days: int = 7
    allow_candidate_self_registration: bool = True
    require_candidate_approval: bool = True
    sms_enabled: bool = False
    sms_provider: str = "twilio"
    sms_sender: str = "VoteEtu"
    maintenance_mode: bool = False
    maintenance_message: str = ""


class PlatformSettingsUpdate(BaseModel):
    school_name: Optional[str] = None
    school_email_domain: Optional[str] = None
    max_election_duration_days: Optional[int] = None
    allow_candidate_self_registration: Optional[bool] = None
    require_candidate_approval: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    sms_provider: Optional[str] = None
    sms_sender: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
