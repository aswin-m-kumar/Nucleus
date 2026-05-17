import os
import sys
import time
from datetime import date
from dotenv import load_dotenv

# Load env vars first
load_dotenv()

# We need the supabase library
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use the backend secret/service key (which is in SUPABASE_ANON_KEY starting with sb_secret_)
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY (as secret key) must be set in .env")
    sys.exit(1)

print(f"Connecting to Supabase Admin at: {SUPABASE_URL}")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

DEMO_PASSWORD = "Demo@1234"

# Use valid .com emails for Supabase TLD validation
DEMO_USERS = [
    # Admin
    {
        "email": "hr@nucleusdemo.com",
        "name": "Priya Nair",
        "role": "admin",
        "department": "HR",
        "manager_email": None
    },
    # Managers
    {
        "email": "mgr.engineering@nucleusdemo.com",
        "name": "Rahul Menon",
        "role": "manager",
        "department": "Engineering",
        "manager_email": None
    },
    {
        "email": "mgr.sales@nucleusdemo.com",
        "name": "Sneha Pillai",
        "role": "manager",
        "department": "Sales",
        "manager_email": None
    },
    # Employees
    {
        "email": "emp1@nucleusdemo.com",
        "name": "Arjun Kumar",
        "role": "employee",
        "department": "Engineering",
        "manager_email": "mgr.engineering@nucleusdemo.com",
        "status": "submitted"
    },
    {
        "email": "emp2@nucleusdemo.com",
        "name": "Divya Raj",
        "role": "employee",
        "department": "Engineering",
        "manager_email": "mgr.engineering@nucleusdemo.com",
        "status": "approved"
    },
    {
        "email": "emp3@nucleusdemo.com",
        "name": "Kiran Das",
        "role": "employee",
        "department": "Sales",
        "manager_email": "mgr.sales@nucleusdemo.com",
        "status": "submitted"
    },
    {
        "email": "emp4@nucleusdemo.com",
        "name": "Meera Nambiar",
        "role": "employee",
        "department": "Sales",
        "manager_email": "mgr.sales@nucleusdemo.com",
        "status": "draft"
    }
]

def get_or_create_auth_and_public_user(user_info):
    email = user_info["email"]
    name = user_info["name"]
    role = user_info["role"]
    dept = user_info["department"]

    # 1. Check if user already exists in public.users to avoid duplication
    try:
        res = supabase.table("users").select("id").eq("email", email).execute()
        if res.data and len(res.data) > 0:
            user_id = res.data[0]["id"]
            print(f"✅ User {email} already exists in database with ID: {user_id}")
            return user_id
    except Exception as e:
        print(f"ℹ️ Error checking public.users for {email}: {e}")

    # 2. Check if user already exists in auth.users by searching or listing (if admin permissions allowed)
    user_id = None
    try:
        # Use admin list users to see if already there
        # Alternatively, try creating directly, and if exists, it will throw an error or we can find them
        print(f"Creating Auth User using Admin API: {email}...")
        admin_res = supabase.auth.admin.create_user({
            "email": email,
            "password": DEMO_PASSWORD,
            "email_confirm": True,
            "user_metadata": {
                "name": name,
                "role": role,
                "department": dept
            }
        })
        user_id = admin_res.user.id
        print(f"✅ Admin Auth User created successfully: {user_id}")
    except Exception as e:
        error_msg = str(e)
        print(f"⚠️ Admin signup failed or user exists: {error_msg}")
        
        # If user already exists in Auth, try logging in to fetch UUID
        try:
            print(f"Attempting login for {email} to retrieve UUID...")
            login_res = supabase.auth.sign_in_with_password({
                "email": email,
                "password": DEMO_PASSWORD
            })
            user_id = login_res.user.id
            print(f"✅ Retrieved UUID via login: {user_id}")
        except Exception as login_err:
            print(f"❌ Failed to resolve existing user UUID: {login_err}")

    if not user_id:
        raise Exception(f"Could not resolve UUID for user {email}")

    # 3. Ensure they are in public.users
    try:
        check = supabase.table("users").select("id").eq("id", user_id).execute()
        if not check.data:
            print(f"Manually inserting user {email} into public.users...")
            supabase.table("users").insert({
                "id": user_id,
                "email": email,
                "name": name,
                "role": role,
                "department": dept
            }).execute()
            print(f"✅ Successfully inserted user {email} into public.users")
        else:
            print(f"✅ User profile {email} already exists in public.users")
    except Exception as e:
        print(f"❌ Error ensuring public.users entry for {email}: {e}")

    return user_id

def seed():
    print("\n--- STAGE 1: Creating/Resolving Users ---")
    user_ids = {}
    for user_info in DEMO_USERS:
        try:
            uid = get_or_create_auth_and_public_user(user_info)
            user_ids[user_info["email"]] = uid
        except Exception as e:
            print(f"💥 Failed to process user {user_info['email']}: {e}")
            sys.exit(1)

    print("\n--- STAGE 2: Linking Employees to Managers ---")
    for user_info in DEMO_USERS:
        if user_info["manager_email"]:
            emp_id = user_ids[user_info["email"]]
            mgr_id = user_ids[user_info["manager_email"]]
            try:
                print(f"Linking {user_info['email']} to manager {user_info['manager_email']}...")
                supabase.table("users").update({"manager_id": mgr_id}).eq("id", emp_id).execute()
                print("✅ Successfully linked")
            except Exception as e:
                print(f"❌ Failed to link employee {user_info['email']}: {e}")

    print("\n--- STAGE 3: Creating Active Cycle ---")
    # Deactivate existing active cycles to avoid confusion
    try:
        supabase.table("cycles").update({"is_active": False}).eq("is_active", True).execute()
    except Exception as e:
        print(f"ℹ️ Warning deactivating old cycles: {e}")

    cycle_id = None
    try:
        # Check if cycle already exists
        check_cycle = supabase.table("cycles").select("*").eq("phase", "FY 2026").execute()
        if check_cycle.data:
            cycle_id = check_cycle.data[0]["id"]
            # Activate it
            supabase.table("cycles").update({"is_active": True}).eq("id", cycle_id).execute()
            print(f"✅ Re-activated existing active cycle 'FY 2026': {cycle_id}")
        else:
            new_c = supabase.table("cycles").insert({
                "phase": "FY 2026",
                "window_open": "2026-04-01",
                "window_close": "2026-06-30",
                "is_active": True
            }).execute()
            cycle_id = new_c.data[0]["id"]
            print(f"✅ Created active cycle 'FY 2026': {cycle_id}")
    except Exception as e:
        print(f"💥 Failed to create cycle: {e}")
        sys.exit(1)

    print("\n--- STAGE 4: Generating Goal Sheets & Goals ---")
    for user_info in DEMO_USERS:
        if user_info["role"] != "employee":
            continue

        emp_id = user_ids[user_info["email"]]
        dept = user_info["department"]
        status = user_info["status"]

        print(f"\nProcessing goal sheet for {user_info['name']} ({dept}) - Status: {status}")

        try:
            # 1. Clean up old sheets for this employee in this cycle
            old_sheets = supabase.table("goal_sheets").select("id").eq("employee_id", emp_id).eq("cycle_id", cycle_id).execute()
            for osheet in old_sheets.data:
                print(f"Cleaning up old sheet {osheet['id']}...")
                supabase.table("goal_sheets").delete().eq("id", osheet["id"]).execute()

            # 2. Insert new sheet
            new_sheet = supabase.table("goal_sheets").insert({
                "employee_id": emp_id,
                "cycle_id": cycle_id,
                "status": status,
                "submitted_at": "2026-04-15T10:00:00Z" if status in ["submitted", "approved"] else None,
                "approved_at": "2026-04-20T14:00:00Z" if status == "approved" else None
            }).execute()
            sheet_id = new_sheet.data[0]["id"]
            print(f"✅ Created goal sheet: {sheet_id}")

            # 3. Formulate goals
            goals = []
            if dept == "Engineering":
                goals = [
                    {
                        "thrust_area": "Operational Excellence",
                        "title": "Increase Unit Test Coverage",
                        "description": "Increase test coverage across core microservices to prevent regressions.",
                        "uom_type": "min",
                        "target": 90,
                        "weightage": 30
                    },
                    {
                        "thrust_area": "Strategic Growth",
                        "title": "Deploy Phase 2 Achievement Tracking Engine",
                        "description": "Release the achievement tracking backend and React portal ahead of scheduling window.",
                        "uom_type": "timeline",
                        "target": 1781481600000,  # June 15, 2026 in timestamp
                        "weightage": 30
                    },
                    {
                        "thrust_area": "Innovation & Tech",
                        "title": "Maintain Core Microservices Uptime",
                        "description": "Ensure production environment achieves premium service levels.",
                        "uom_type": "min",
                        "target": 99.9,
                        "weightage": 25
                    },
                    {
                        "thrust_area": "Operational Excellence",
                        "title": "Limit Critical Production Bugs",
                        "description": "Prevent high-severity bugs from slipping through regression pipelines.",
                        "uom_type": "max",
                        "target": 3,
                        "weightage": 15
                    }
                ]
            else: # Sales
                goals = [
                    {
                        "thrust_area": "Strategic Growth",
                        "title": "Achieve Sales Target",
                        "description": "Drive commercial growth and target premium organizational accounts.",
                        "uom_type": "min",
                        "target": 1500000,
                        "weightage": 40
                    },
                    {
                        "thrust_area": "Customer Success",
                        "title": "Acquire Premium Enterprise Clients",
                        "description": "Sign contracts with enterprise level logos to establish key account dominance.",
                        "uom_type": "min",
                        "target": 10,
                        "weightage": 30
                    },
                    {
                        "thrust_area": "Customer Success",
                        "title": "Optimize SLA Response Times",
                        "description": "Resolve priority enterprise inquiries under customer SLA window.",
                        "uom_type": "max",
                        "target": 2,
                        "weightage": 20
                    },
                    {
                        "thrust_area": "Sustainability",
                        "title": "Zero Premium Contract Cancellations",
                        "description": "Retain key partners and maintain high renewal rate.",
                        "uom_type": "zero",
                        "target": 0,
                        "weightage": 10
                    }
                ]

            # 4. Insert goals and track created goal details
            created_goals = []
            for goal_info in goals:
                g_res = supabase.table("goals").insert({
                    "sheet_id": sheet_id,
                    "thrust_area": goal_info["thrust_area"],
                    "title": goal_info["title"],
                    "description": goal_info["description"],
                    "uom_type": goal_info["uom_type"],
                    "target": goal_info["target"],
                    "weightage": goal_info["weightage"],
                    "owner_id": emp_id
                }).execute()
                created_goals.append(g_res.data[0])
            print(f"✅ Successfully seeded {len(created_goals)} goals (total weightage: 100%)")

            # 5. Populate Q1 Progress for submitted and approved sheets
            if status in ["submitted", "approved"]:
                print("Seeding Q1 progress data...")
                for idx, goal in enumerate(created_goals):
                    actual_val = 0
                    prog_status = "not_started"
                    
                    # Logic for realistic values
                    if dept == "Engineering":
                        # Arjun Kumar (submitted): close to targets
                        # Divya Raj (approved): exceeds targets
                        is_divya = (user_info["email"] == "emp2@nucleusdemo.com")
                        
                        if idx == 0: # Coverage: Target 90
                            actual_val = 92 if is_divya else 88
                            prog_status = "completed" if actual_val >= 90 else "on_track"
                        elif idx == 1: # Timeline: Target 1781481600000
                            actual_val = 1781049600000 if is_divya else 1781827200000 # Divya met timeline, Arjun late
                            prog_status = "completed" if actual_val <= 1781481600000 else "not_started"
                        elif idx == 2: # Uptime: Target 99.9
                            actual_val = 99.95 if is_divya else 99.5
                            prog_status = "completed" if actual_val >= 99.9 else "on_track"
                        elif idx == 3: # Bugs: Target max 3
                            actual_val = 1 if is_divya else 4
                            prog_status = "completed" if actual_val <= 3 else "not_started"
                    
                    else: # Sales
                        # Kiran Das (submitted)
                        if idx == 0: # Revenue: Target 1500000
                            actual_val = 1350000
                            prog_status = "on_track"
                        elif idx == 1: # Clients: Target 10
                            actual_val = 8
                            prog_status = "on_track"
                        elif idx == 2: # Response: Target max 2
                            actual_val = 3.5
                            prog_status = "not_started"
                        elif idx == 3: # Churn: Target zero 0
                            actual_val = 1
                            prog_status = "not_started"

                    # Build progress entry
                    prog_entry = {
                        "goal_id": goal["id"],
                        "quarter": "Q1",
                        "actual": actual_val,
                        "status": prog_status,
                        "employee_updated_at": "2026-05-01T15:00:00Z"
                    }

                    # Add manager review if approved
                    if status == "approved":
                        prog_entry["manager_comment"] = "Exceptional results, metrics exceeded target!"
                        prog_entry["manager_reviewed_at"] = "2026-05-10T12:00:00Z"

                    supabase.table("quarterly_progress").insert(prog_entry).execute()
                print("✅ Q1 Progress entries completed successfully.")

        except Exception as e:
            print(f"💥 Failed seeding goal sheet and progress: {e}")

    print("\n🎉 DEMO SEEDING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    seed()
