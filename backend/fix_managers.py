"""
One-time diagnostic + fix script for manager assignment issues.
Dumps current DB state, identifies mismatches, and corrects manager_id assignments.
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

def diagnose_and_fix():
    print("=" * 60)
    print("NUCLEUS DB DIAGNOSTIC & FIX")
    print("=" * 60)

    # ── Step 1: Dump all users ──
    print("\n--- Step 1: Current public.users table ---")
    all_users = supabase.table("users").select("id, email, name, role, manager_id, department").execute()
    
    user_map = {}  # email -> row
    id_to_email = {}  # id -> email
    
    for u in all_users.data:
        user_map[u["email"]] = u
        id_to_email[u["id"]] = u["email"]
        mgr_email = id_to_email.get(u["manager_id"], "None") if u["manager_id"] else "None"
        print(f"  {u['name']:20s} | {u['email']:40s} | role: {u['role']:10s} | manager_id: {str(u['manager_id'])[:8] if u['manager_id'] else 'NULL':10s} | dept: {u.get('department', 'N/A')}")

    # Build reverse map for manager lookup after all users are loaded
    print("\n--- Step 2: Manager assignment analysis ---")
    for u in all_users.data:
        mgr_id = u.get("manager_id")
        if mgr_id:
            mgr_email = id_to_email.get(mgr_id, "UNKNOWN ID: " + str(mgr_id))
            print(f"  {u['name']:20s} ({u['email']}) -> Manager: {mgr_email}")
        elif u["role"] == "employee":
            print(f"  ⚠️ {u['name']:20s} ({u['email']}) -> Manager: NULL (MISSING!)")

    # ── Step 3: Define expected assignments ──
    expected = {
        "emp1@nucleusdemo.com": "mgr.engineering@nucleusdemo.com",
        "emp2@nucleusdemo.com": "mgr.engineering@nucleusdemo.com",
        "emp3@nucleusdemo.com": "mgr.sales@nucleusdemo.com",
        "emp4@nucleusdemo.com": "mgr.sales@nucleusdemo.com",
    }

    # ── Step 4: Check and fix mismatches ──
    print("\n--- Step 3: Checking & fixing manager assignments ---")
    fixes_applied = 0
    
    for emp_email, mgr_email in expected.items():
        emp = user_map.get(emp_email)
        mgr = user_map.get(mgr_email)
        
        if not emp:
            print(f"  ❌ Employee {emp_email} not found in public.users!")
            continue
        if not mgr:
            print(f"  ❌ Manager {mgr_email} not found in public.users!")
            continue

        current_mgr_id = emp.get("manager_id")
        correct_mgr_id = mgr["id"]

        if current_mgr_id == correct_mgr_id:
            print(f"  ✅ {emp['name']} -> {mgr['name']} (correct)")
        else:
            current_mgr_name = "NULL"
            if current_mgr_id:
                current_mgr_email = id_to_email.get(current_mgr_id, "UNKNOWN")
                current_mgr_row = user_map.get(current_mgr_email)
                current_mgr_name = current_mgr_row["name"] if current_mgr_row else current_mgr_email
            
            print(f"  🔧 FIXING {emp['name']}: {current_mgr_name} -> {mgr['name']}")
            try:
                supabase.table("users").update({"manager_id": correct_mgr_id}).eq("id", emp["id"]).execute()
                print(f"     ✅ Updated successfully!")
                fixes_applied += 1
            except Exception as e:
                print(f"     ❌ Update failed: {e}")

    # ── Step 5: Clean up stale/test users ──
    print("\n--- Step 4: Checking for stale test users ---")
    demo_emails = [
        "hr@nucleusdemo.com",
        "mgr.engineering@nucleusdemo.com",
        "mgr.sales@nucleusdemo.com",
        "emp1@nucleusdemo.com",
        "emp2@nucleusdemo.com",
        "emp3@nucleusdemo.com",
        "emp4@nucleusdemo.com",
    ]
    for u in all_users.data:
        if u["email"] not in demo_emails:
            print(f"  ℹ️ Non-demo user found: {u['name']} ({u['email']}) - role: {u['role']}")

    # ── Step 6: Verify team query works ──
    print("\n--- Step 5: Verifying team sheet queries ---")
    
    for mgr_email in ["mgr.engineering@nucleusdemo.com", "mgr.sales@nucleusdemo.com"]:
        mgr = user_map.get(mgr_email)
        if not mgr:
            print(f"  ❌ Manager {mgr_email} not found!")
            continue
        
        mgr_id = mgr["id"]
        # Simulate the exact query from sheet_service.get_team_sheets
        employees = supabase.table("users").select("id, name, email").eq("manager_id", mgr_id).execute()
        employee_ids = [e["id"] for e in employees.data]
        
        print(f"\n  Manager: {mgr['name']} ({mgr_email})")
        print(f"  Team members found: {len(employees.data)}")
        for emp in employees.data:
            print(f"    - {emp['name']} ({emp['email']})")
        
        if employee_ids:
            sheets = supabase.table("goal_sheets").select("id, status, employee_id").in_("employee_id", employee_ids).execute()
            print(f"  Team sheets found: {len(sheets.data)}")
            for s in sheets.data:
                emp_email = id_to_email.get(s["employee_id"], "?")
                print(f"    - Sheet {s['id'][:8]}... | status: {s['status']} | employee: {emp_email}")
        else:
            print(f"  ⚠️ NO team members! /sheets/team will return empty.")

    print(f"\n{'=' * 60}")
    print(f"DONE. Applied {fixes_applied} fix(es).")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    diagnose_and_fix()
