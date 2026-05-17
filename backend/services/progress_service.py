from core.supabase import supabase
from fastapi import HTTPException
from datetime import datetime

class ProgressService:
    @staticmethod
    def _verify_employee_ownership(goal_id: str, user_id: str):
        # Fetch goal and sheet to verify ownership
        goal_res = supabase.table("goals").select("sheet_id").eq("id", goal_id).execute()
        if not goal_res.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        sheet_id = goal_res.data[0]["sheet_id"]
        sheet_res = supabase.table("goal_sheets").select("employee_id, status").eq("id", sheet_id).execute()
        if not sheet_res.data:
            raise HTTPException(status_code=404, detail="Sheet not found")
        
        if sheet_res.data[0]["employee_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this goal")
        
        if sheet_res.data[0]["status"] != "approved":
            raise HTTPException(status_code=400, detail="Cannot log progress on unapproved sheet")

    @staticmethod
    def _verify_manager_access(goal_id: str, manager_id: str):
        goal_res = supabase.table("goals").select("sheet_id").eq("id", goal_id).execute()
        if not goal_res.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        sheet_id = goal_res.data[0]["sheet_id"]
        sheet_res = supabase.table("goal_sheets").select("employee_id").eq("id", sheet_id).execute()
        
        emp_id = sheet_res.data[0]["employee_id"]
        emp_res = supabase.table("users").select("manager_id").eq("id", emp_id).execute()
        
        if not emp_res.data or emp_res.data[0]["manager_id"] != manager_id:
            # Admins might bypass this in a real system, but strictly checking manager_id here
            admin_check = supabase.table("users").select("role").eq("id", manager_id).execute()
            if not admin_check.data or admin_check.data[0]["role"] != "admin":
                raise HTTPException(status_code=403, detail="Not authorized to check-in for this employee")

    @staticmethod
    def log_achievement(goal_id: str, quarter: str, actual: float, status: str, user_id: str):
        ProgressService._verify_employee_ownership(goal_id, user_id)
        
        # Upsert logic to handle both POST and PATCH
        data = {
            "goal_id": goal_id,
            "quarter": quarter,
            "actual": actual,
            "status": status,
            "employee_updated_at": datetime.utcnow().isoformat()
        }
        
        res = supabase.table("quarterly_progress").upsert(data, on_conflict="goal_id,quarter").execute()
        return res.data[0] if res.data else None

    @staticmethod
    def get_sheet_achievements(sheet_id: str):
        try:
            # Join goals and quarterly_progress
            goals_res = supabase.table("goals").select("id").eq("sheet_id", sheet_id).execute()
            if not goals_res.data:
                return []

            goal_ids = [g["id"] for g in goals_res.data]
            prog_res = supabase.table("quarterly_progress").select("*").in_("goal_id", goal_ids).execute()
            return prog_res.data
        except Exception as e:
            raise Exception({"error": str(e), "code": "CHECKIN_FETCH_ERROR"})

    @staticmethod
    def manager_checkin(goal_id: str, quarter: str, comment: str, manager_id: str):
        ProgressService._verify_manager_access(goal_id, manager_id)
        
        # Ensure achievement exists first
        check_res = supabase.table("quarterly_progress").select("id").eq("goal_id", goal_id).eq("quarter", quarter).execute()
        if not check_res.data:
            raise HTTPException(status_code=400, detail="Employee has not logged progress for this quarter yet")

        data = {
            "manager_comment": comment,
            "manager_reviewed_at": datetime.utcnow().isoformat()
        }
        
        res = supabase.table("quarterly_progress").update(data).eq("goal_id", goal_id).eq("quarter", quarter).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def get_team_checkins(manager_id: str):
        try:
            # 1. Get employees
            emp_res = supabase.table("users").select("id").eq("manager_id", manager_id).execute()
            emp_ids = [e["id"] for e in emp_res.data]
            if not emp_ids:
                return []

            # 2. Get their sheets
            sheet_res = supabase.table("goal_sheets").select("id").in_("employee_id", emp_ids).execute()
            sheet_ids = [s["id"] for s in sheet_res.data]
            if not sheet_ids:
                return []

            # 3. Get goals
            goals_res = supabase.table("goals").select("id").in_("sheet_id", sheet_ids).execute()
            goal_ids = [g["id"] for g in goals_res.data]
            if not goal_ids:
                return []

            # 4. Get progress
            prog_res = supabase.table("quarterly_progress").select("*").in_("goal_id", goal_ids).execute()
            return prog_res.data
        except Exception as e:
            raise Exception({"error": str(e), "code": "CHECKIN_FETCH_ERROR"})

progress_service = ProgressService()
