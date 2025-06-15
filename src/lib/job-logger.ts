// Job History Logging Utility
import { 
  createJobStart, 
  updateJobCompletion, 
  updateJobFailure, 
  getJobHistory as getJobHistoryData,
  getJobStats as getJobStatsData,
  getRecentJobFailures,
  getRunningJobs,
  cleanupOldJobHistory,
  JobStatus,
  JobLogEntry,
  JobStats
} from './data/worker-data';

export type { JobStatus, JobLogEntry, JobStats };

export class JobLogger {
  private static workerId = `worker-${Math.random().toString(36).substring(7)}`;

  static async logJobStart(taskName: string, payload?: any, jobId?: string): Promise<number> {
    return await createJobStart(taskName, payload, jobId, this.workerId);
  }

  static async logJobCompletion(logId: number, duration?: number): Promise<void> {
    await updateJobCompletion(logId, duration);
  }

  static async logJobFailure(logId: number, errorMessage: string, duration?: number): Promise<void> {
    await updateJobFailure(logId, errorMessage, duration);
  }

  // Get job history with optional filters
  static async getJobHistory(
    taskName?: string, 
    status?: JobStatus, 
    limit: number = 100,
    offset: number = 0
  ): Promise<JobLogEntry[]> {
    return await getJobHistoryData(taskName, status, limit, offset);
  }

  // Get job statistics
  static async getJobStats(hours: number = 24): Promise<JobStats[]> {
    return await getJobStatsData(hours);
  }

  // Additional utility methods
  static async getRecentFailures(hours: number = 24, limit: number = 50): Promise<JobLogEntry[]> {
    return await getRecentJobFailures(hours, limit);
  }

  static async getRunningJobs(): Promise<JobLogEntry[]> {
    return await getRunningJobs();
  }

  static async cleanupOldHistory(daysToKeep: number = 30): Promise<number> {
    return await cleanupOldJobHistory(daysToKeep);
  }
}
