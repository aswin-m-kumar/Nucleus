from fastapi import HTTPException, status
from datetime import datetime
from core.supabase import supabase
from models.sheet import SheetStatus
from validators.goal_validators import validate_weightage
from services.audit_service import audit_service

class SheetService:
    @staticmethod
    def create_sheet(user_id: str, cycle_id: str):
        # Check if cycle is active
        cycle = supabase.table("cycles").select("*").eq("id", cycle_id).eq("is_active", True).single().execute()
        if not cycle.data:
            raise HTTPException(status_code=400, detail="Active cycle not found")
        
        # Check if sheet already exists
        existing = supabase.table("goal_sheets").select("*").eq("employee_id", user_id).eq("cycle_id", cycle_id).execute()
        if existing.data:
            return existing.data[0]
            
        response = supabase.table("goal_sheets").insert({
            "employee_id": user_id,
            "cycle_id": cycle_id,
            "status": SheetStatus.draft
        }).execute()
        return response.data[0]

    @staticmethod
    def get_my_sheet(user_id: str):
        response = supabase.table("goal_sheets").select("*, goals(*)").eq("employee_id", user_id).order("created_at", desc=True).limit(1).execute()
        if not response.data:
            return None
        return response.data[0]

    @staticmethod
    def submit_sheet(sheet_id: str, user_id: str):
        # Fetch sheet and goals
        sheet = supabase.table("goal_sheets").select("*, goals(*)").eq("id", sheet_id).single().execute()
        if not sheet.data:
            raise HTTPException(status_code=404, detail="Sheet not found")
        
        if sheet.data["employee_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your sheet")
            
        validate_weightage(sheet.data["goals"])
        
        if len(sheet.data["goals"]) == 0:
            raise HTTPException(status_code=400, detail="Sheet must have at least one goal")

        response = supabase.table("goal_sheets").update({
            "status": SheetStatus.submitted,
            "submitted_at": datetime.utcnow().isoformat()
        }).eq("id", sheet_id).execute()
        return response.data[0]

    @staticmethod
    def get_team_sheets(manager_id: str):
        try:
            # Get employees under this manager
            employees = supabase.table("users").select("id").eq("manager_id", manager_id).execute()
            employee_ids = [e["id"] for e in employees.data]

            if not employee_ids:
                return []

            response = supabase.table("goal_sheets").select("*, goals(*), users!inner(name, email, department)").in_("employee_id", employee_ids).execute()
            return response.data
        except Exception as e:
            raise Exception({"error": str(e), "code": "TEAM_SHEETS_FETCH_ERROR"})

    @staticmethod
    def approve_sheet(sheet_id: str, manager_id: str):
        # Verify sheet belongs to manager's team
        sheet = supabase.table("goal_sheets").select("*, users!inner(manager_id)").eq("id", sheet_id).execute()
        if not sheet.data or sheet.data[0]["users"]["manager_id"] != manager_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        response = supabase.table("goal_sheets").update({
            "status": SheetStatus.approved,
            "approved_at": datetime.utcnow().isoformat()
        }).eq("id", sheet_id).execute()
        
        # Log approval
        audit_service.log_change("sheet", sheet_id, manager_id, "approve", None, {"status": SheetStatus.approved})
        
        return response.data[0]

    @staticmethod
    def return_sheet(sheet_id: str, manager_id: str, comment: str):
        # Verify sheet belongs to manager's team
        sheet = supabase.table("goal_sheets").select("*, users!inner(manager_id)").eq("id", sheet_id).execute()
        if not sheet.data or sheet.data[0]["users"]["manager_id"] != manager_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        response = supabase.table("goal_sheets").update({
            "status": SheetStatus.returned
        }).eq("id", sheet_id).execute()
        
        # Log the return with comment
        audit_service.log_change("sheet", sheet_id, manager_id, "return", None, {"comment": comment, "status": SheetStatus.returned})
        
        return response.data[0]

    @staticmethod
    def unlock_sheet(sheet_id: str, admin_id: str, reason: str):
        response = supabase.table("goal_sheets").update({
            "status": SheetStatus.draft
        }).eq("id", sheet_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Sheet not found")
            
        audit_service.log_change("sheet", sheet_id, admin_id, "emergency_unlock", None, {"reason": reason, "status": SheetStatus.draft})
        
        return response.data[0]

sheet_service = SheetService()
