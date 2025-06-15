// Task wrapper for job execution with logging
import { Task } from 'graphile-worker';
import { JobLogger } from '../lib/job-logger.js';

export function runJob(taskName: string, taskFunction: Task): Task {
  return async (payload, helpers) => {
    const startTime = Date.now();
    const logId = await JobLogger.logJobStart(taskName, payload);
    
    try {
      helpers.logger.info(`Starting ${taskName}...`);
      
      // Execute the actual task
      const result = await taskFunction(payload, helpers);
      
      const duration = Date.now() - startTime;
      await JobLogger.logJobCompletion(logId, duration);
      
      helpers.logger.info(`${taskName} completed successfully in ${duration}ms`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
        await JobLogger.logJobFailure(logId, errorMessage, duration);
      helpers.logger.error(`${taskName} failed after ${duration}ms: ${errorMessage}`);
      
      throw error; // Re-throw to maintain original error handling
    }
  };
}
