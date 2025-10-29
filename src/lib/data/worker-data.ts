"use server";

import sql from "../db";

export type JobStatus = 'started' | 'completed' | 'failed';

export interface JobLogEntry {
  id?: number;
  job_id?: string;
  task_name: string;
  payload?: any;
  status: JobStatus;
  started_at?: Date;
  completed_at?: Date;
  duration_ms?: number;
  error_message?: string;
  worker_id?: string;
}

export interface JobStats {
  task_name: string;
  total_jobs: number;
  completed: number;
  failed: number;
  running: number;
  avg_duration_ms: number;
  max_duration_ms: number;
}

// Create job start entry
export async function createJobStart(taskName: string, payload?: any, jobId?: string, workerId?: string): Promise<number> {
  try {
    const result = await sql`
      INSERT INTO graphile_worker.job_history (
        job_id, task_name, payload, status, started_at, worker_id
      ) VALUES (
        ${jobId || null}, 
        ${taskName}, 
        ${payload ? JSON.stringify(payload) : null}, 
        'started', 
        NOW(), 
        ${workerId || null}
      )
      RETURNING id
    `;
    return result[0].id;
  } catch (error) {
    console.error('Failed to create job start entry:', error);
    return -1; // Return invalid ID on error
  }
}

// Update job completion
export async function updateJobCompletion(logId: number, duration?: number): Promise<void> {
  if (logId <= 0) return; // Skip if invalid log ID
  
  try {
    await sql`
      UPDATE graphile_worker.job_history 
      SET status = 'completed', 
          completed_at = NOW(),
          duration_ms = ${duration || null}
      WHERE id = ${logId}
    `;
  } catch (error) {
    console.error('Failed to update job completion:', error);
  }
}

// Update job failure
export async function updateJobFailure(logId: number, errorMessage: string, duration?: number): Promise<void> {
  if (logId <= 0) return; // Skip if invalid log ID
  
  try {
    await sql`
      UPDATE graphile_worker.job_history 
      SET status = 'failed', 
          completed_at = NOW(),
          duration_ms = ${duration || null},
          error_message = ${errorMessage}
      WHERE id = ${logId}
    `;
  } catch (error) {
    console.error('Failed to update job failure:', error);
  }
}

// Get job history with optional filters
export async function getJobHistory(
  taskName?: string, 
  status?: JobStatus, 
  limit: number = 100,
  offset: number = 0
): Promise<JobLogEntry[]> {
  try {
    const conditions = [];
    const params = [];

    if (taskName) {
      conditions.push(`task_name = $${params.length + 1}`);
      params.push(taskName);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';    const result = await sql<JobLogEntry[]>`
      SELECT * FROM graphile_worker.job_history 
      ${sql.unsafe(whereClause)}
      ORDER BY started_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    return result;
  } catch (error) {
    console.error('Failed to get job history:', error);
    return [];
  }
}

// Get job statistics
export async function getJobStats(hours: number = 24): Promise<JobStats[]> {
  try {
    const result = await sql<JobStats[]>`
      SELECT 
        task_name,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'started' THEN 1 END) as running,
        AVG(duration_ms) as avg_duration_ms,
        MAX(duration_ms) as max_duration_ms
      FROM graphile_worker.job_history 
      WHERE started_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY task_name
      ORDER BY total_jobs DESC
    `;

    return result;
  } catch (error) {
    console.error('Failed to get job stats:', error);
    return [];
  }
}

// Get recent job failures for monitoring
export async function getRecentJobFailures(hours: number = 24, limit: number = 50): Promise<JobLogEntry[]> {
  try {
    const result = await sql<JobLogEntry[]>`
      SELECT 
        id, task_name, error_message, started_at, completed_at, duration_ms, worker_id
      FROM graphile_worker.job_history 
      WHERE status = 'failed' 
        AND started_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY started_at DESC 
      LIMIT ${limit}
    `;

    return result;
  } catch (error) {
    console.error('Failed to get recent job failures:', error);
    return [];
  }
}

// Get running jobs (started but not completed/failed)
export async function getRunningJobs(): Promise<JobLogEntry[]> {
  try {
    const result = await sql<JobLogEntry[]>`
      SELECT 
        id, task_name, started_at, worker_id, payload
      FROM graphile_worker.job_history 
      WHERE status = 'started'
      ORDER BY started_at DESC
    `;

    return result;
  } catch (error) {
    console.error('Failed to get running jobs:', error);
    return [];
  }
}

// Clean up old job history entries
export async function cleanupOldJobHistory(daysToKeep: number = 30): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM graphile_worker.job_history 
      WHERE started_at < NOW() - INTERVAL '${daysToKeep} days'
      RETURNING id
    `;

    return result.length;
  } catch (error) {
    console.error('Failed to cleanup old job history:', error);
    return 0;
  }
}
