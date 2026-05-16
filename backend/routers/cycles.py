from fastapi import APIRouter, Depends, HTTPException
from core.auth import get_current_user
from core.supabase import supabase

router = APIRouter(prefix="/cycles", tags=["Cycles"])

@router.get("/active")
async def get_active_cycle(user: dict = Depends(get_current_user)):
    response = supabase.table("cycles").select("*").eq("is_active", True).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No active cycle found")
    # Return the most recently created active cycle just in case
    return response.data[0]
