from fastapi import APIRouter, Depends
from core.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
