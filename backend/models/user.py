from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    department: str
    manager_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
