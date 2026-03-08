from typing import List
import uuid
from datetime import datetime
from pydantic import BaseModel


class CandidateCreate(BaseModel):
    display_name: str
    bio: str | None = None
    avatar_url: str | None = None
    program: str | None = None
    position: str | None = None
    slogan: str | None = None
    priorities: List[str] = []


class CandidateRead(BaseModel):
    id: str
    election_id: str
    user_id: str
    display_name: str
    bio: str | None
    avatar_url: str | None
    program: str | None = None
    position: str | None = None
    slogan: str | None = None
    priorities: List[str] = []
    vote_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    program: str | None = None
    position: str | None = None
    slogan: str | None = None
    priorities: List[str] | None = None
