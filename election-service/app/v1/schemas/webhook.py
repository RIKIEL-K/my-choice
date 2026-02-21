import uuid
from pydantic import BaseModel, EmailStr


class UserCreatedPayload(BaseModel):
    """
    Payload sent by auth-service when a new user registers.
    The election-service uses this to create an empty ElectionUser profile.
    """
    user_id: str
    email: EmailStr
    display_name: str | None = None


class VoteCreate(BaseModel):
    """Payload for casting a vote."""
    candidate_id: str
