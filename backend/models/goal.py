from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class UoMType(str, Enum):
    min = "min"
    max = "max"
    timeline = "timeline"
    zero = "zero"

class GoalBase(BaseModel):
    thrust_area: str
    title: str
    description: str
    uom_type: UoMType
    target: float
    weightage: float
    is_shared: bool = False

class GoalCreate(GoalBase):
    sheet_id: Optional[str] = None

class GoalUpdate(BaseModel):
    thrust_area: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    uom_type: Optional[UoMType] = None
    target: Optional[float] = None
    weightage: Optional[float] = None

class GoalResponse(GoalBase):
    id: str
    sheet_id: str
    owner_id: str
