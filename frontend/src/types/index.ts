export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  manager_id?: string;
  created_at: string;
}

export type SheetStatus = 'draft' | 'submitted' | 'approved' | 'returned';

export type UoMType = 'min' | 'max' | 'timeline' | 'zero';

export interface Goal {
  id: string;
  sheet_id: string;
  thrust_area: string;
  title: string;
  description: string;
  uom_type: UoMType;
  target: number;
  weightage: number;
  is_shared: boolean;
  owner_id: string;
}

export interface GoalSheet {
  id: string;
  employee_id: string;
  cycle_id: string;
  status: SheetStatus;
  submitted_at?: string;
  approved_at?: string;
  goals: Goal[];
  users?: {
    name: string;
    email: string;
    department: string;
  };
}

export interface Cycle {
  id: string;
  phase: string;
  window_open: string;
  window_close: string;
  is_active: boolean;
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ProgressStatus = 'not_started' | 'on_track' | 'completed';

export interface ProgressResponse {
  id: string;
  goal_id: string;
  quarter: Quarter;
  actual: number | null;
  status: ProgressStatus;
  employee_updated_at: string | null;
  manager_comment: string | null;
  manager_reviewed_at: string | null;
}

