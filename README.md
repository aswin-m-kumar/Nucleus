# Nucleus — Goal Setting & Performance Tracking Portal

> **Core of the organization, everything revolves around it.**

Built for **AtomQuest 1.0 Hackathon** by **Atomberg Technologies**.

## 🌐 Live Demo & Deployments
*   **App UI**: [https://nucleus-phi.vercel.app](https://nucleus-phi.vercel.app)
*   **Backend Server**: [https://nucleus-d8st.onrender.com](https://nucleus-d8st.onrender.com)

---

## 🔑 Demo Sandbox Credentials
The default password for all sandbox accounts is **`Demo@1234`**.

| Role | Name | Email | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | Priya Nair | `hr@nucleusdemo.com` | HR |
| **Manager** | Rahul Menon | `mgr.engineering@nucleusdemo.com` | Engineering |
| **Manager** | Sneha Pillai | `mgr.sales@nucleusdemo.com` | Sales |
| **Employee** | Arjun Kumar | `emp1@nucleusdemo.com` | Engineering |
| **Employee** | Divya Raj | `emp2@nucleusdemo.com` | Engineering |
| **Employee** | Kiran Das | `emp3@nucleusdemo.com` | Sales |
| **Employee** | Meera Nambiar | `emp4@nucleusdemo.com` | Sales |

---

## 🛠️ Stack & Architecture
*   **Frontend**: React 19 + Vite + Tailwind CSS v4 + TypeScript
*   **Backend**: FastAPI (Python 3.9+) + Pydantic
*   **Database & Auth**: Supabase (PostgreSQL + Gotrue Auth + Row-Level Security)
*   **Hosting**: Vercel (Frontend) + Render (Backend)

---

## ✨ Features Built (Phase 1 & Phase 2)

*   **Role-Based Access Control**: Tailored portals with dedicated UI views for employees, line managers, and platform administrators.
*   **Rigorous Weightage Validation**: Dynamic tracking that guarantees that goal sets must sum to **exactly 100%** before submission.
*   **Audit Trails**: Organization-wide immutable logs capturing all action operators, old/new states, timestamps, and database rows.
*   **Quarterly Progress Logging**: Track progress logs across **Q1–Q4** with status trackers (`not_started`, `on_track`, `completed`) and inline manager reviews.
*   **Dynamic UI Engine**: Stark minimalist design system with dark-mode HSL colors, responsive tables, interactive slide-over panels, and custom-animated Atom Orbit SVG icons.
*   **Cycle & Admin Controls**: Create and activate review windows, push shared corporate goals to selected employees, and initiate emergency unlocking for locked goal sheets.

---

## 🧮 UoM Metric Scoring System
The scoring logic operates identically on both the TypeScript frontend (`scoringUtils.ts`) and Python backend (`scoring_service.py`), ensuring consistent and safe score caps:

1.  **Min (Higher is better)**:
    $$\text{Score} = \text{Min}\left(\frac{\text{Actual}}{\text{Target}} \times 100,\ 100\right)$$
2.  **Max (Lower is better)**:
    $$\text{Score} = \text{Min}\left(\frac{\text{Target}}{\text{Actual}} \times 100,\ 100\right)$$
3.  **Timeline (Deliver by date)**:
    $$\text{Score} = 100\% \text{ if } \text{Actual} \le \text{Target (timestamp)} \text{ else } 0\%$$
4.  **Zero Tolerance (Avoidance)**:
    $$\text{Score} = 100\% \text{ if } \text{Actual} == 0 \text{ else } 0\%$$

---

## ⚡ Setup & Launch Instructions

### 1. Repository Configuration
Copy the default environments in both directories:
*   In `/backend`, configure `.env` with Supabase URLs and Keys.
*   In `/frontend`, configure `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.

### 2. Auto-Provisioning Sandbox
We have created an automated admin seeding utility that completely bypasses Supabase API public signup rate limits and automatically builds employee-manager chains with simulated state logs.

```bash
cd backend
pip install -r requirements.txt
python seed_demo.py
```

*If manager assignments ever get corrupted by manual DB operations, simply execute our quick recovery diagnostic:*
```bash
python fix_managers.py
```

### 3. Start Services
*   **Backend FastAPI**:
    ```bash
    cd backend
    uvicorn main:app --reload
    ```
*   **Frontend React App**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
