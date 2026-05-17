from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from typing import Optional
from core.auth import check_role
from services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/achievement")
async def get_achievement_report(
    department: Optional[str] = None,
    quarter: Optional[str] = None,
    user: dict = Depends(check_role(["admin"]))
):
    return report_service.get_achievement_report(department, quarter)

@router.get("/completion")
async def get_completion_report(
    quarter: str,
    user: dict = Depends(check_role(["admin"]))
):
    return report_service.get_completion_report(quarter)

@router.get("/achievement/export", response_class=PlainTextResponse)
async def export_achievement_csv(
    department: Optional[str] = None,
    quarter: Optional[str] = None,
    user: dict = Depends(check_role(["admin"]))
):
    csv_data = report_service.export_achievement_csv(department, quarter)
    return PlainTextResponse(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=achievement_report_{quarter or 'all'}.csv"}
    )
