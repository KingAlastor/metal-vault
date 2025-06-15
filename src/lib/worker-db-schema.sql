-- Job History Logging Table
-- Add this to your database schema in the graphile_worker schema

CREATE TABLE graphile_worker.job_history (
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

-- Index for better query performance
CREATE INDEX idx_job_history_task_name ON graphile_worker.job_history(task_name);
CREATE INDEX idx_job_history_status ON graphile_worker.job_history(status);
CREATE INDEX idx_job_history_started_at ON graphile_worker.job_history(started_at);

-- Optional: Auto-cleanup old records (keep last 30 days)
-- You can run this as a scheduled job or manually
-- DELETE FROM graphile_worker.job_history WHERE created_at < NOW() - INTERVAL '30 days';
