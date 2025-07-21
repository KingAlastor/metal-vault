# Job History Deployment Guide

## VPS Deployment Steps

### 1. Deploy Database Schema
Connect to your VPS PostgreSQL database and run:
```bash
psql -U postgres -d your_database_name -f deploy-job-history.sql
```

Or manually execute the SQL:
```sql
-- Create the job_history table in the graphile_worker schema
CREATE TABLE IF NOT EXISTS graphile_worker.job_history (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(36),
  task_name VARCHAR(255) NOT NULL,
  payload JSONB,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  error_message TEXT,
  worker_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_history_task_name ON graphile_worker.job_history(task_name);
CREATE INDEX IF NOT EXISTS idx_job_history_status ON graphile_worker.job_history(status);
CREATE INDEX IF NOT EXISTS idx_job_history_started_at ON graphile_worker.job_history(started_at);
```

### 2. Push Code Changes
```bash
# Push to your repository
git add .
git commit -m "Add job history logging system with fixed PostgreSQL JSON query"
git push origin main
```

### 3. Deploy to VPS
```bash
# On your VPS
cd /path/to/metal-vault
git pull origin main
npm install
npm run build
pm2 restart ecosystem.config.js
```

### 4. Verify Deployment
```bash
# Check PM2 status
pm2 list
pm2 logs metal-vault-worker --lines 20

# Test the job history API
curl http://localhost:3000/api/worker/history

# Run worker once to test
npm run worker:once
```

### 5. Monitor Job History
```bash
# Check job history in database
psql -U postgres -d your_database_name -c "SELECT * FROM graphile_worker.job_history ORDER BY created_at DESC LIMIT 10;"

# View job statistics via API
curl http://localhost:3000/api/worker/history?stats=true
```

## Features Added

### 1. Fixed PostgreSQL JSON Query
- Changed `email_settings != ''` to `email_settings::text != 'null' AND email_settings::text != '{}'`
- Fixed JSON comparison operator error

### 2. Job History Logging
- **Database Table**: `graphile_worker.job_history` with comprehensive tracking
- **Data Layer**: `lib/data/worker-data.ts` handles all SQL operations
- **JobLogger Class**: Service layer that uses the data layer for job lifecycle logging
- **Task Wrapper**: `runJob()` executes tasks with automatic logging
- **API Endpoint**: `/api/worker/history` for viewing job history

### 3. Environment Loading
- Migrated from conditional dotenv to `@next/env`
- Consistent environment variable loading across Next.js and worker

### 4. Enhanced Worker Features
- **Historical Tracking**: All job executions are logged with duration and status
- **Statistics**: Job success rates, average duration, and failure tracking
- **API Access**: Query job history with filtering and pagination
- **Error Logging**: Detailed error messages for failed jobs

## API Usage

### View Job History
```bash
# Get recent jobs
curl http://localhost:3000/api/worker/history

# Get jobs with statistics
curl http://localhost:3000/api/worker/history?stats=true

# Filter by task name
curl http://localhost:3000/api/worker/history?task=email-weekly-newsletter

# Filter by status
curl http://localhost:3000/api/worker/history?status=failed

# Pagination
curl http://localhost:3000/api/worker/history?page=2&limit=20
```

### Example Response
```json
{
  "jobs": [
    {
      "id": 1,
      "job_id": "job_123",
      "task_name": "email-weekly-newsletter",
      "status": "completed",
      "started_at": "2024-01-15T10:00:00Z",
      "completed_at": "2024-01-15T10:02:30Z",
      "duration_ms": 150000,
      "worker_id": "worker_001"
    }
  ],
  "stats": {
    "total_jobs": 156,
    "completed": 142,
    "failed": 14,
    "success_rate": 91.03,
    "avg_duration_ms": 45000
  }
}
```

## Task Registration

All tasks are now automatically wrapped with job execution:
```typescript
// In worker/index.ts
await worker.addTask('email-weekly-newsletter', runJob('email-weekly-newsletter', emailWeeklyNewsletterTask));
await worker.addTask('email-monthly-newsletter', runJob('email-monthly-newsletter', emailMonthlyNewsletterTask));
await worker.addTask('sync-band-data', runJob('sync-band-data', syncBandDataTask));
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
psql -U postgres -d your_database_name -c "SELECT 1;"

# Verify graphile_worker schema exists
psql -U postgres -d your_database_name -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'graphile_worker';"
```

### Worker Issues
```bash
# Check worker logs
pm2 logs metal-vault-worker --lines 50

# Test individual task
npm run worker:once

# Check job history
psql -U postgres -d your_database_name -c "SELECT task_name, status, COUNT(*) FROM graphile_worker.job_history GROUP BY task_name, status;"
```

### API Issues
```bash
# Test API endpoint
curl -v http://localhost:3000/api/worker/history

# Check Next.js logs
pm2 logs metal-vault-app --lines 20
```

## Cleanup

### Auto-cleanup Old Records
Add this to your scheduled jobs to keep the history table manageable:
```sql
-- Clean up jobs older than 30 days
DELETE FROM graphile_worker.job_history WHERE created_at < NOW() - INTERVAL '30 days';
```

### Manual Cleanup
```sql
-- Clean up completed jobs older than 7 days
DELETE FROM graphile_worker.job_history 
WHERE status = 'completed' AND created_at < NOW() - INTERVAL '7 days';

-- Keep only failed jobs for analysis
DELETE FROM graphile_worker.job_history 
WHERE status = 'failed' AND created_at < NOW() - INTERVAL '30 days';
```

## Next Steps

1. **Deploy the database schema** using the provided SQL script
2. **Push and deploy the code changes** to your VPS
3. **Test the worker** with `npm run worker:once`
4. **Monitor job history** via the API endpoint
5. **Set up log rotation** for the job history table
6. **Monitor email tasks** to ensure they run successfully with the fixed PostgreSQL query

The worker should now run successfully with comprehensive job logging and the PostgreSQL JSON comparison issue resolved!
