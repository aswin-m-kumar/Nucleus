from fastapi import HTTPException, status
from core.supabase import supabase
from services.audit_service import audit_service
from datetime import datetime

class AdminService:
    @staticmethod
    def list_users():
        # Fetch users with their manager names if possible
        response = supabase.table("users").select("*").execute()
        return response.data

    @staticmethod
    def assign_manager(employee_id: str, manager_id: str, admin_id: str):
        # Verify manager exists and is a manager
        manager = supabase.table("users").select("role").eq("id", manager_id).single().execute()
        if not manager.data or manager.data["role"] not in ["manager", "admin"]:
            raise HTTPException(status_code=400, detail="Target user is not a manager")
        
        response = supabase.table("users").update({"manager_id": manager_id}).eq("id", employee_id).execute()
        
        audit_service.log_change("user", employee_id, admin_id, "assign_manager", None, {"manager_id": manager_id})
        return response.data[0]

    @staticmethod
    def create_cycle(name: str, window_open: str, window_close: str):
        response = supabase.table("cycles").insert({
            "phase": name,
            "window_open": window_open,
            "window_close": window_close,
            "is_active": False
        }).execute()
        return response.data[0]

    @staticmethod
    def activate_cycle(cycle_id: str, admin_id: str):
        # Deactivate all cycles
        supabase.table("cycles").update({"is_active": False}).neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        # Activate target cycle
        response = supabase.table("cycles").update({"is_active": True}).eq("id", cycle_id).execute()
        
        audit_service.log_change("cycle", cycle_id, admin_id, "activate", None, {"is_active": True})
        return response.data[0]

admin_service = AdminService()
