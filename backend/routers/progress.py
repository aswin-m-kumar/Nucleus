from fastapi import APIRouter, Depends, Body, Path
from typing import List
from core.auth import get_current_user, check_role
from models.progress import AchievementCreate, AchievementUpdate, CheckInCreate, ProgressResponse, QuarterEnum
from services.progress_service import progress_service

achievements_router = APIRouter(prefix="/achievements", tags=["Achievements"])
checkins_router = APIRouter(prefix="/checkins", tags=["Check-ins"])

@achievements_router.post("/{goal_id}", response_model=ProgressResponse)
async def log_achievement(
    goal_id: str,
    payload: AchievementCreate,
    user: dict = Depends(check_role(["employee"]))
):
    return progress_service.log_achievement(
        goal_id, payload.quarter.value, payload.actual, payload.status.value, user["id"]
    )

@achievements_router.patch("/{goal_id}/{quarter}", response_model=ProgressResponse)
async def update_achievement(
    goal_id: str,
    quarter: QuarterEnum,
    payload: AchievementUpdate,
    user: dict = Depends(check_role(["employee"]))
):
    return progress_service.log_achievement(
        goal_id, quarter.value, payload.actual, payload.status.value, user["id"]
    )

@achievements_router.get("/sheet/{sheet_id}", response_model=List[ProgressResponse])
async def get_sheet_achievements(
    sheet_id: str,
    user: dict = Depends(get_current_user)
):
    return progress_service.get_sheet_achievements(sheet_id)

@checkins_router.post("/{goal_id}/{quarter}", response_model=ProgressResponse)
async def add_checkin(
    goal_id: str,
    quarter: QuarterEnum,
    payload: CheckInCreate,
    user: dict = Depends(check_role(["manager", "admin"]))
):
    return progress_service.manager_checkin(goal_id, quarter.value, payload.manager_comment, user["id"])

@checkins_router.get("/team", response_model=List[ProgressResponse])
async def get_team_checkins(
    user: dict = Depends(check_role(["manager", "admin"]))
):
    return progress_service.get_team_checkins(user["id"])
