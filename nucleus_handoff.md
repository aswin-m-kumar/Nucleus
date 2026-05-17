# Nucleus Performance Portal — Developer Handoff Document

This document serves as the absolute blueprint and status report for **Nucleus** — a Goal Setting & Performance Tracking Portal built for Atomberg Technologies. Use this file to immediately bring another AI developer or engineer up to speed on the project architecture, stack state, logic, and Phase 2 progression.

---

## 🚀 Project Overview & Identity
*   **Name**: Nucleus ("Core of the organization, everything revolves around it.")
*   **Aesthetic**: Linear.app meets Notion. Stark minimalist, metric-driven, responsive dark-mode variables, subtle micro-interactions, flat high-fidelity card aesthetics.
*   **Tech Stack**:
    *   **Frontend**: React 19 + Vite + Tailwind CSS v4 + TypeScript.
    *   **Backend**: FastAPI (Python 3.9+) + Pydantic.
    *   **Database & Auth**: Supabase (PostgreSQL, Auth, RLS Policies).

---

## 📂 System Architecture & Schema

### 1. Database Primitives (`supabase_schema.sql` + `supabase_schema_phase2.sql`)
*   **`users`**: Extends Supabase `auth.users` with fields `name`, `email`, `role` (`employee`, `manager`, `admin`), `manager_id` (self-referencing FK), `department`, and `created_at`.
*   **`cycles`**: Evaluates active goals period. Columns: `phase` (ex: "FY 2026"), `window_open` (date), `window_close` (date), `is_active` (boolean).
*   **`goal_sheets`**: Employee performance sheets. State machine tracked via `status` (`draft`, `submitted`, `approved`, `returned`).
*   **`goals`**: Individual KPIs mapped to sheets. Custom mathematical strategy set by `uom_type` (`min`, `max`, `timeline`, `zero`), `target` (numeric), `weightage` (numeric, must sum to exactly 100% per sheet).
*   **`quarterly_progress`**: Phase 2 log of metric actuals per goal per quarter (`Q1`–`Q4`). Fields: `actual`, `status` (`not_started`, `on_track`, `completed`), `employee_updated_at`, `manager_comment`, `manager_reviewed_at`.
*   **`audit_logs`**: Immutable security ledger capturing all changes, operators, timestamps, and before/after states.

### 2. Auto-Provisioning Auth Trigger
Supabase Auth calls `public.handle_new_user()` on signup, auto-inserting the corresponding record in `public.users`.

---

## 🛠️ Current State of Implementation

### 🛡️ Core Reusable Components (`src/components/ui/`)
All widgets are custom-designed from scratch (no external generic component libraries):
*   `Button.tsx` (primary, secondary, danger, warning variants; active scale-98 hover).
*   `Input.tsx` / `Textarea.tsx` (focus rings, errors, adaptive label spacing).
*   `Select.tsx` (integrated custom chevron select dropdown).
*   `Badge.tsx` (workflow status tags with optional animate-pulse triggers).
*   `Card.tsx` / `MetricCard.tsx` (flat, modern UI wrappers featuring numeric scaling).
*   `ProgressBar.tsx` / `WeightageBar.tsx` (visual weight tracker).
*   `Alert.tsx` (informational dismissable prompts).
*   `Table.tsx` (scrollable, responsive tabular data view).
*   `SlideOver.tsx` (form overlay panel complete with screen focus-trap).
*   `EmptyState.tsx` (fallback display for blank cycles/dashboards).

### 🖥️ Dashboards & Pages
*   **Login (`Login.tsx`)**: Split-pane layout with custom atom orbital SVG animation, adaptive fields, and error boundary protections.
*   **Employee Dashboard (`EmployeeDashboard.tsx`)**: Metric cards for overall progress and weightage alignment, interactive quarters selection, and dynamic KPI panels.
*   **Manager Dashboard (`ManagerDashboard.tsx`)**: Accordion rosters grouping employees, interactive checklist audits, returned-feedback prompts, and check-in review interfaces.
*   **Admin Dashboard (`AdminDashboard.tsx`)**: Multi-tab workspace organizing active cycles, shared KPI deployments, user listings, and dynamic CSV reporting.

### 🎛️ Mathematical Scoring Engine
Implementation is synchronized between Python backend (`backend/services/scoring_service.py`) and TypeScript frontend (`frontend/src/utils/scoringUtils.ts`):
*   `min`: $\text{achievement} / \text{target}$ (higher is better, ex: sales target, test coverage).
*   `max`: $\text{target} / \text{achievement}$ (lower is better, ex: SLA response times, server latency).
*   `timeline`: $100\%$ if achieved on/before timestamp, else $0\%$.
*   `zero`: $100\%$ if actual is exactly $0$, else $0\%$ (ex: churn rate).
*   *Note*: Scores are securely capped at $100\%$ and handle division by zero safely.

---

## ⚡ Setup & Verification Procedures

### 1. Seeding Data
Run the automated seed script to populate a rich sandbox environment:
```bash
cd backend
python seed_demo.py
```
This provisions:
*   `hr@nucleusdemo.com` (Admin: Priya Nair)
*   `mgr.engineering@nucleusdemo.com` & `mgr.sales@nucleusdemo.com` (Managers)
*   `emp1@nucleusdemo.com` to `emp4@nucleusdemo.com` (Employees with submitted, approved, and draft sheets and simulated Q1 progress logged).
*   *Note*: The default password for all seed accounts is `Demo@1234`.

### 2. Frontend Local Compilation
```bash
cd frontend
npm run build # Confirms 100% build safety and code compliance
```

---

## 📌 Phase 2 Integration Checklist
The UI is completely refactored and ready. The incoming AI agent should integrate the logic layers next:
1.  **Frontend API Binding**: Connect input actions on the employee progress selectors directly to `POST/PATCH` calls targeting the backend `/achievements/{goal_id}` endpoints.
2.  **Scoring Engine Visuals**: Read scores calculated by `scoringUtils.ts` in real-time, showing visual feedback rings/badges on the progress trackers.
3.  **Unlock Request Flows**: Set up UI mechanics for requesting, processing, and logged-auditing quarterly sheet lock/unlock actions.

---

### 🛑 HANDOFF AGENT INSTRUCTION:
> [!IMPORTANT]
> **Please wait for the user to prompt "Start Phase 2 Integration" before modifying the database schemas, API controllers, or frontend state management wrappers.**
