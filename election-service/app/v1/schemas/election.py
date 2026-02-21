import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.election import ElectionStatus


class CandidateRead(BaseModel):
    id: str
    user_id: str
    display_name: str
    bio: str | None
    avatar_url: str | None
    vote_count: int = 0

    model_config = {"from_attributes": True}


class ElectionRead(BaseModel):
    id: str
    title: str
    description: str | None
    start_date: datetime
    end_date: datetime
    status: ElectionStatus
    total_voters: int
    vote_count: int
    participation: float  # percentage 0-100
    candidates: list[CandidateRead] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ElectionCreate(BaseModel):
    title: str
    description: str | None = None
    start_date: datetime
    end_date: datetime
    total_voters: int = 0
    status: ElectionStatus = ElectionStatus.draft


class ElectionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    total_voters: int | None = None
    status: ElectionStatus | None = None


class ElectionListResponse(BaseModel):
    items: list[ElectionRead]
    total: int
    page: int
    size: int
