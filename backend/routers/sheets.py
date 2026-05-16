from fastapi import APIRouter, Depends, Body
from typing import List
from core.auth import get_current_user, check_role
from services.sheet_service import sheet_service
from models.sheet import GoalSheetCreate

router = APIRouter(prefix="/sheets", tags=["Sheets"])

@router.post("")
async def create_sheet(data: GoalSheetCreate, user: dict = Depends(get_current_user)):
    return sheet_service.create_sheet(user["id"], data.cycle_id)

@router.get("/me")
async def get_my_sheet(user: dict = Depends(get_current_user)):
    return sheet_service.get_my_sheet(user["id"])

@router.post("/{sheet_id}/submit")
async def submit_sheet(sheet_id: str, user: dict = Depends(get_current_user)):
    return sheet_service.submit_sheet(sheet_id, user["id"])

@router.get("/team")
async def get_team_sheets(user: dict = Depends(check_role(["manager", "admin"]))):
    return sheet_service.get_team_sheets(user["id"])

@router.patch("/{sheet_id}/approve")
async def approve_sheet(sheet_id: str, user: dict = Depends(check_role(["manager", "admin"]))):
    return sheet_service.approve_sheet(sheet_id, user["id"])

@router.patch("/{sheet_id}/return")
async def return_sheet(sheet_id: str, comment: str = Body(..., embed=True), user: dict = Depends(check_role(["manager", "admin"]))):
    return sheet_service.return_sheet(sheet_id, user["id"], comment)
