# AtomQuest Goal Setting & Tracking Portal (Phase 1)

This project is a modular Goal Setting and Tracking Portal built with FastAPI and React.

## Structure
- `/backend`: FastAPI service with business logic, validation, and audit logging.
- `/frontend`: React + Vite + Tailwind + shadcn/ui.

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Project

### Database Setup
1. Go to your Supabase Project -> SQL Editor.
2. Copy the contents of `supabase_schema.sql` (found in the root) and run it.

### Backend Setup
1. Navigate to `/backend`.
2. Create a `.env` file from the template:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CORS_ORIGINS=http://localhost:5173
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python main.py`

### Frontend Setup
1. Navigate to `/frontend`.
2. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8000
   ```
3. Install dependencies: `npm install`
4. Run the app: `npm run dev`

### Seed Data
1. Manually create the following users in Supabase Auth:
   - admin@atomquest.com
   - manager1@atomquest.com
   - manager2@atomquest.com
   - employee1@atomquest.com
   - employee2@atomquest.com
   - employee3@atomquest.com
   - employee4@atomquest.com
2. Get their UUIDs from Supabase and insert them into the `public.users` table with correct roles.
3. Run `python seed.py` in the `/backend` directory to create the active cycle.

## Role Credentials (Example)
- **Admin**: admin@atomquest.com / password
- **Manager**: manager1@atomquest.com / password
- **Employee**: employee1@atomquest.com / password

## Phase 1 Features
- [x] JWT Auth with Supabase
- [x] Goal Sheet creation for active cycles
- [x] 100% weightage validation on submission
- [x] Manager approval/return workflow
- [x] Admin-pushed shared KPIs
- [x] Immutable goals after approval
- [x] Organization-wide Audit Logging
