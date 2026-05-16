import os
from supabase import create_client, Client
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Need service role for bypassing RLS or creating users

if not SUPABASE_SERVICE_ROLE_KEY:
    print("Please provide SUPABASE_SERVICE_ROLE_KEY in .env to run the seed script.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed():
    # 1. Create Active Cycle
    print("Seeding cycle...")
    cycle_response = supabase.table("cycles").insert({
        "phase": "Phase 1 - 2026",
        "window_open": str(date.today()),
        "window_close": str(date.today() + timedelta(days=30)),
        "is_active": True
    }).execute()
    cycle_id = cycle_response.data[0]["id"]
    print(f"Created cycle: {cycle_id}")

    # Note: User creation in auth.users requires admin privileges.
    # For this hackathon, we assume the user will create these users in Supabase Auth UI 
    # and then run this script with their IDs.
    # Alternatively, if we had user IDs, we'd insert into public.users.
    
    print("\nSeed script completed for Cycles.")
    print("IMPORTANT: Manually create users in Supabase Auth and then insert them into the 'public.users' table with the following roles:")
    print("- 1 Admin")
    print("- 2 Managers")
    print("- 4 Employees (assign manager_id to link them)")

if __name__ == "__main__":
    seed()
