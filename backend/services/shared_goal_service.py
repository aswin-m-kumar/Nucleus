from fastapi import HTTPException
from core.supabase import supabase
from models.goal import GoalBase
from services.audit_service import audit_service

class SharedGoalService:
    @staticmethod
    def push_shared_goal(user_ids: list[str], goal_data: GoalBase, admin_id: str):
        results = []
        for user_id in user_ids:
            # Find active sheet for user
            sheet = supabase.table("goal_sheets").select("id").eq("employee_id", user_id).order("created_at", desc=True).limit(1).execute()
            if not sheet.data:
                continue
                
            sheet_id = sheet.data[0]["id"]
            
            response = supabase.table("goals").insert({
                **goal_data.model_dump(),
                "sheet_id": sheet_id,
                "owner_id": user_id,
                "is_shared": True
            }).execute()
            
            if response.data:
                results.append(response.data[0])
                audit_service.log_change("goal", response.data[0]["id"], admin_id, "push_shared", None, response.data[0])
                
        return results

    @staticmethod
    def unlock_goal(goal_id: str, admin_id: str):
        # Change sheet status back to submitted or returned to allow editing
        goal = supabase.table("goals").select("sheet_id").eq("id", goal_id).single().execute()
        if not goal.data:
            raise HTTPException(status_code=404, detail="Goal not found")
            
        sheet_id = goal.data["sheet_id"]
        response = supabase.table("goal_sheets").update({"status": "returned"}).eq("id", sheet_id).execute()
        
        audit_service.log_change("sheet", sheet_id, admin_id, "unlock", {"old_status": "approved"}, {"new_status": "returned"})
        return response.data[0]

shared_goal_service = SharedGoalService()
