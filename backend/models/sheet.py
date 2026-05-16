from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from models.goal import GoalResponse

class SheetStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    returned = "returned"

class GoalSheetBase(BaseModel):
    employee_id: str
    cycle_id: str
    status: SheetStatus = SheetStatus.draft

class GoalSheetCreate(BaseModel):
    cycle_id: str

class GoalSheetResponse(GoalSheetBase):
    id: str
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    goals: List[GoalResponse] = []

class CycleBase(BaseModel):
    phase: str
    window_open: date
    window_close: date
    is_active: bool

class CycleResponse(CycleBase):
    id: str
