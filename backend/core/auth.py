import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings
from core.supabase import supabase

logger = logging.getLogger("nucleus.auth")
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Validate token using Supabase Auth Server (handles all JWT signing algorithms)
        auth_response = supabase.auth.get_user(token)
        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        
        auth_user = auth_response.user
        user_id = str(auth_user.id)  # Ensure string UUID from JWT "sub" field
        logger.info(f"[AUTH] JWT resolved -> id={user_id}, email={auth_user.email}")
        
        # Try to fetch user details from our users table
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            db_user = response.data[0]
            logger.info(f"[AUTH] DB user matched -> id={db_user['id']}, role={db_user['role']}")
            return db_user
        
        # User exists in auth but not in our users table — auto-create their profile
        meta = auth_user.user_metadata or {}
        new_user = {
            "id": user_id,
            "email": auth_user.email,
            "name": meta.get("name", "New User"),
            "role": meta.get("role", "employee"),
            "department": meta.get("department", "Engineering"),
        }
        
        insert_response = supabase.table("users").insert(new_user).execute()
        if not insert_response.data or len(insert_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile",
            )
        
        return insert_response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )

def check_role(roles: list[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this resource",
            )
        return user
    return role_checker
