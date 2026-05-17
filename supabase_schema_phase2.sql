-- Add to your Supabase SQL Editor to support Phase 2: Achievement Tracking & Quarterly Check-ins

CREATE TYPE progress_status AS ENUM ('not_started', 'on_track', 'completed');
CREATE TYPE quarter_enum AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

CREATE TABLE quarterly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter quarter_enum NOT NULL,
  actual NUMERIC,
  status progress_status DEFAULT 'not_started',
  employee_updated_at TIMESTAMP WITH TIME ZONE,
  manager_comment TEXT,
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(goal_id, quarter)
);

-- Enable RLS for quarterly_progress (optional, but good practice if you have RLS on other tables)
ALTER TABLE quarterly_progress ENABLE ROW LEVEL SECURITY;

-- If you are using service_role for everything, this policy allows all operations
CREATE POLICY "Allow all operations for service role" ON quarterly_progress
  FOR ALL USING (true) WITH CHECK (true);
