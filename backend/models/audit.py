from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: str
    changed_by: str
    change_type: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None

class AuditLogResponse(AuditLogBase):
    id: str
    timestamp: datetime
