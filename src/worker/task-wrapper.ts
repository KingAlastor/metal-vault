// Task wrapper for job execution with logging
import { Task } from 'graphile-worker';
import { JobLogger } from '../lib/job-logger.js';

export function runJob(taskName: string, taskFunction: Task): Task {
  return async (payload, helpers) => {
    const startTime = Date.now();
    const logId = await JobLogger.logJobStart(taskName, payload);
    
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        helpers.logger.info(`Starting ${taskName} (attempt ${attempt}/${maxRetries})...`);
        
        // Execute the actual task
        const result = await taskFunction(payload, helpers);
        
        const duration = Date.now() - startTime;
        await JobLogger.logJobCompletion(logId, duration);
        
        helpers.logger.info(`${taskName} completed successfully in ${duration}ms`);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;
        
        // Check if it's a database connection error that we should retry
        const isRetryableError = errorMessage.includes('terminating connection') || 
                                errorMessage.includes('connection error') ||
                                errorMessage.includes('Client has encountered a connection error');
        
        if (isRetryableError && attempt < maxRetries) {
          const waitTime = Math.min(5000 * attempt, 30000); // Exponential backoff
          helpers.logger.warn(`${taskName} failed with retryable error (attempt ${attempt}): ${errorMessage}. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Non-retryable error or max retries reached
        const duration = Date.now() - startTime;
        await JobLogger.logJobFailure(logId, errorMessage, duration);
        helpers.logger.error(`${taskName} failed after ${duration}ms: ${errorMessage}`);
        
        throw lastError; // Re-throw to maintain original error handling
      }
    }
  };
}
