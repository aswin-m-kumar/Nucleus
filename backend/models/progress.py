from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class QuarterEnum(str, Enum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"

class ProgressStatus(str, Enum):
    not_started = "not_started"
    on_track = "on_track"
    completed = "completed"

class AchievementCreate(BaseModel):
    quarter: QuarterEnum
    actual: float
    status: ProgressStatus

class AchievementUpdate(BaseModel):
    actual: Optional[float] = None
    status: Optional[ProgressStatus] = None

class CheckInCreate(BaseModel):
    manager_comment: str

class ProgressResponse(BaseModel):
    id: str
    goal_id: str
    quarter: QuarterEnum
    actual: Optional[float]
    status: ProgressStatus
    employee_updated_at: Optional[datetime]
    manager_comment: Optional[str]
    manager_reviewed_at: Optional[datetime]
