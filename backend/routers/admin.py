from fastapi import APIRouter, Depends, Body
from typing import List
from core.auth import check_role
from services.shared_goal_service import shared_goal_service
from services.admin_service import admin_service
from services.sheet_service import sheet_service
from models.goal import GoalBase

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
async def list_users(user: dict = Depends(check_role(["admin"]))):
    return admin_service.list_users()

@router.patch("/users/{user_id}/assign-manager")
async def assign_manager(user_id: str, manager_id: str = Body(..., embed=True), user: dict = Depends(check_role(["admin"]))):
    return admin_service.assign_manager(user_id, manager_id, user["id"])

@router.post("/cycles")
async def create_cycle(name: str = Body(..., embed=True), window_open: str = Body(..., embed=True), window_close: str = Body(..., embed=True), user: dict = Depends(check_role(["admin"]))):
    return admin_service.create_cycle(name, window_open, window_close)

@router.get("/cycles")
async def list_cycles(user: dict = Depends(check_role(["admin"]))):
    from core.supabase import supabase
    response = supabase.table("cycles").select("*").execute()
    return response.data

@router.patch("/cycles/{cycle_id}/activate")
async def activate_cycle(cycle_id: str, user: dict = Depends(check_role(["admin"]))):
    return admin_service.activate_cycle(cycle_id, user["id"])

@router.patch("/sheets/{sheet_id}/unlock")
async def unlock_sheet(sheet_id: str, reason: str = Body(..., embed=True), user: dict = Depends(check_role(["admin"]))):
    return sheet_service.unlock_sheet(sheet_id, user["id"], reason)

@router.post("/shared-goals")
async def push_shared_goal(user_ids: List[str] = Body(...), goal_data: GoalBase = Body(...), user: dict = Depends(check_role(["admin"]))):
    return shared_goal_service.push_shared_goal(user_ids, goal_data, user["id"])

