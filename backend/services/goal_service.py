from fastapi import HTTPException, status
from core.supabase import supabase
from models.goal import GoalCreate, GoalUpdate
from validators.goal_validators import validate_min_weightage, validate_goal_count, validate_lock
from services.audit_service import audit_service

class GoalService:
    @staticmethod
    def add_goal(goal_data: GoalCreate, user_id: str):
        # Check sheet status
        sheet = supabase.table("goal_sheets").select("status").eq("id", goal_data.sheet_id).single().execute()
        if not sheet.data:
            raise HTTPException(status_code=404, detail="Sheet not found")
        
        validate_lock(sheet.data["status"])
        validate_min_weightage(goal_data.weightage)
        
        # Check goal count
        goals = supabase.table("goals").select("id").eq("sheet_id", goal_data.sheet_id).execute()
        validate_goal_count(len(goals.data))
        
        response = supabase.table("goals").insert({
            **goal_data.model_dump(),
            "owner_id": user_id
        }).execute()
        
        return response.data[0]

    @staticmethod
    def update_goal(goal_id: str, goal_data: GoalUpdate, user_id: str, user_role: str):
        # Fetch current goal
        goal = supabase.table("goals").select("*, goal_sheets(status)").eq("id", goal_id).single().execute()
        if not goal.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        sheet_status = goal.data["goal_sheets"]["status"]
        
        # Admin can update even after approval, but must log it
        if user_role == "admin":
            old_value = {k: v for k, v in goal.data.items() if k != "goal_sheets"}
            response = supabase.table("goals").update(goal_data.model_dump(exclude_unset=True)).eq("id", goal_id).execute()
            audit_service.log_change("goal", goal_id, user_id, "admin_update", old_value, response.data[0])
            return response.data[0]

        validate_lock(sheet_status)
        
        if goal_data.weightage is not None:
            validate_min_weightage(goal_data.weightage)
            
        # If shared goal, only weightage is editable
        if goal.data.get("is_shared"):
            update_dict = {"weightage": goal_data.weightage} if goal_data.weightage is not None else {}
            if not update_dict:
                return goal.data
        else:
            update_dict = goal_data.model_dump(exclude_unset=True)

        response = supabase.table("goals").update(update_dict).eq("id", goal_id).execute()
        return response.data[0]

    @staticmethod
    def delete_goal(goal_id: str, user_id: str):
        goal = supabase.table("goals").select("*, goal_sheets(status)").eq("id", goal_id).single().execute()
        if not goal.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        validate_lock(goal.data["goal_sheets"]["status"])
        
        if goal.data.get("is_shared"):
            raise HTTPException(status_code=403, detail="Cannot delete shared goals")

        supabase.table("goals").delete().eq("id", goal_id).execute()
        return {"message": "Goal deleted"}

goal_service = GoalService()
