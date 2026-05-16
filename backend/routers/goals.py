from fastapi import APIRouter, Depends
from core.auth import get_current_user
from services.goal_service import goal_service
from models.goal import GoalCreate, GoalUpdate

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("/sheets/{sheet_id}/goals")
async def add_goal(sheet_id: str, data: GoalCreate, user: dict = Depends(get_current_user)):
    data.sheet_id = sheet_id
    return goal_service.add_goal(data, user["id"])

@router.patch("/{goal_id}")
async def update_goal(goal_id: str, data: GoalUpdate, user: dict = Depends(get_current_user)):
    return goal_service.update_goal(goal_id, data, user["id"], user["role"])

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, user: dict = Depends(get_current_user)):
    return goal_service.delete_goal(goal_id, user["id"])
