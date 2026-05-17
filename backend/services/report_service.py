from core.supabase import supabase
from services.scoring_service import compute_score

class ReportService:
    @staticmethod
    def get_achievement_report(department: str = None, quarter: str = None):
        # In a real system, you'd use a SQL View or RPC. Using client-side joins here due to REST constraints.
        # Fetch all users
        users_query = supabase.table("users").select("id, name, department")
        if department:
            users_query = users_query.eq("department", department)
        users = {u["id"]: u for u in users_query.execute().data}
        
        # Fetch all sheets for these users
        sheets_res = supabase.table("goal_sheets").select("id, employee_id, status").in_("employee_id", list(users.keys())).execute()
        sheets = {s["id"]: s for s in sheets_res.data}
        
        # Fetch goals for these sheets
        goals_res = supabase.table("goals").select("*").in_("sheet_id", list(sheets.keys())).execute()
        goals = {g["id"]: g for g in goals_res.data}
        
        # Fetch progress
        prog_query = supabase.table("quarterly_progress").select("*").in_("goal_id", list(goals.keys()))
        if quarter:
            prog_query = prog_query.eq("quarter", quarter)
        progress = prog_query.execute().data
        
        report = []
        for p in progress:
            goal = goals[p["goal_id"]]
            sheet = sheets[goal["sheet_id"]]
            user = users[sheet["employee_id"]]
            
            score = compute_score(goal["uom_type"], goal["target"], p["actual"])
            
            report.append({
                "employee_name": user["name"],
                "department": user["department"],
                "goal_title": goal["title"],
                "quarter": p["quarter"],
                "target": goal["target"],
                "actual": p["actual"],
                "score": score,
                "status": p["status"],
                "manager_comment": p["manager_comment"]
            })
            
        return report

    @staticmethod
    def get_completion_report(quarter: str):
        # Employees who have logged progress in the quarter vs total employees with approved sheets
        sheets_res = supabase.table("goal_sheets").select("id, employee_id").eq("status", "approved").execute()
        approved_emp_ids = set([s["employee_id"] for s in sheets_res.data])
        
        goals_res = supabase.table("goals").select("id, sheet_id").in_("sheet_id", [s["id"] for s in sheets_res.data]).execute()
        goal_to_emp = {g["id"]: next(s["employee_id"] for s in sheets_res.data if s["id"] == g["sheet_id"]) for g in goals_res.data}
        
        prog_res = supabase.table("quarterly_progress").select("goal_id").eq("quarter", quarter).execute()
        completed_emp_ids = set([goal_to_emp[p["goal_id"]] for p in prog_res.data if p["goal_id"] in goal_to_emp])
        
        users_res = supabase.table("users").select("id, name").in_("id", list(approved_emp_ids)).execute()
        users = {u["id"]: u["name"] for u in users_res.data}
        
        report = []
        for emp_id in approved_emp_ids:
            report.append({
                "employee_name": users.get(emp_id, "Unknown"),
                "has_completed": emp_id in completed_emp_ids
            })
            
        return report

    @staticmethod
    def export_achievement_csv(department: str = None, quarter: str = None):
        import csv
        import io
        
        data = ReportService.get_achievement_report(department, quarter)
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["employee_name", "department", "goal_title", "quarter", "target", "actual", "score", "status", "manager_comment"])
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()

report_service = ReportService()
