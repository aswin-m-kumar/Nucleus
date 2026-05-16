from fastapi import HTTPException, status
from typing import List
from models.goal import GoalResponse
from models.sheet import SheetStatus

def validate_weightage(goals: List[dict]):
    total_weightage = sum(goal.get("weightage", 0) for goal in goals)
    if total_weightage != 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total weightage must be exactly 100%. Current: {total_weightage}%",
        )

def validate_min_weightage(weightage: float):
    if weightage < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum weightage per goal is 10%",
        )

def validate_goal_count(count: int):
    if count >= 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum goals per employee per sheet is 8",
        )

def validate_lock(status: str):
    if status == SheetStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Goals are immutable after approval",
        )
