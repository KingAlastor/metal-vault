-- Deploy Job History Table to VPS
-- This script creates the job_history table in the graphile_worker schema
-- Run this on your VPS database before deploying the updated worker code

-- Create the job_history table in the graphile_worker schema
CREATE TABLE IF NOT EXISTS graphile_worker.job_history (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(36),
  task_name VARCHAR(255) NOT NULL,
  payload JSONB,
  status VARCHAR(20) NOT NULL, -- 'started', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  error_message TEXT,
  worker_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_history_task_name ON graphile_worker.job_history(task_name);
CREATE INDEX IF NOT EXISTS idx_job_history_status ON graphile_worker.job_history(status);
CREATE INDEX IF NOT EXISTS idx_job_history_started_at ON graphile_worker.job_history(started_at);

-- Verify the table was created
SELECT 'job_history table created successfully in graphile_worker schema' as status;

-- Optional: Show table structure
\d graphile_worker.job_history;
