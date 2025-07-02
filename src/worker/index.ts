// Load environment variables using @next/env for consistent loading
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { run } from "graphile-worker";
// Import the new tasks
import {
  syncAllBands,
  syncLatestBands,
  syncAlbums,
  syncUpcomingReleases,
} from "./tasks/sync-tasks";
import { sendScheduledEmails } from "./tasks/email-tasks";
import { runJob } from "./task-wrapper.js";

async function main() {
  const dbConnectionString = process.env.DATABASE_URL;
  console.log("DATABASE_URL seen by worker:", dbConnectionString);
  if (!dbConnectionString) {
    throw new Error("DATABASE_URL environment variable is not set!");
  }
  const shouldRunOnce = process.argv.includes("--once");  // Define the schedules for your tasks
  const crontab = [
    // Sync upcoming releases daily at 12:30 AM (before emails)
    "30 0 * * * sync_upcoming_releases ?jobKey=scraping",
    // Send weekly emails daily at 9 AM (for testing) - no jobKey, can run concurrently with others
    "0 9 * * * send_weekly_emails",
    // Send monthly emails on the 1st of every month at 9 AM - no jobKey
    "0 9 1 * * send_monthly_emails",
    // Run latest band sync daily at 1 AM
    // "0 1 * * * sync_latest_bands ?jobKey=scraping",
    // Run album sync daily at 2 AM (spaced 1 hour after other jobs)
    "0 2 * * * sync_albums ?jobKey=scraping",
    // Run full band sync weekly on Sunday at 4 AM (increased gap, this is the longest job)
    "0 4 * * 0 sync_all_bands ?jobKey=scraping",
    // Add more schedules here if needed
  ].join("\n");
  console.log("Starting worker...");
  const runner = await run({
    connectionString: dbConnectionString,
    concurrency: 2, // Allow 2 jobs: 1 scraping + 1 non-scraping (emails)
    // noHandleSignals: false, // Recommended to keep this false unless debugging
    pollInterval: 1000,
    // Define the list of tasks the worker can run
    taskList: {
      sync_all_bands: runJob("sync_all_bands", syncAllBands),
      sync_upcoming_releases: runJob(
        "sync_upcoming_releases",
        syncUpcomingReleases
      ),
      send_weekly_emails: runJob("send_weekly_emails", sendScheduledEmails),
      send_monthly_emails: runJob("send_monthly_emails", sendScheduledEmails),
      // sync_latest_bands: syncLatestBands,
      sync_albums: syncAlbums,
      // Add other task identifiers here if you create more tasks
    },
    // Add the crontab for scheduled tasks
    crontab: crontab,
  });

  console.log("Worker started successfully.");

  // Graceful shutdown
  const stop = async () => {
    try {
      console.log("Stopping worker...");
      await runner.stop();
      console.log("Worker stopped.");
      process.exit(0);
    } catch (err) {
      console.error("Error stopping worker:", err);
      process.exit(1);
    }
  };

  if (shouldRunOnce) {
    // If --once is passed, wait for the current jobs to complete and then stop.
    // Note: This doesn't automatically run scheduled jobs, only jobs already in the queue.
    // You might need to manually add a job if you want --once to run a specific task.
    console.log("Running worker once...");
    await runner.promise; // Wait for worker to settle (no more jobs running)
    await stop();
  } else {
    // Listen for termination signals
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }

  // Keep the worker running indefinitely unless stopped
  await runner.promise;
}

main().catch((err) => {
  console.error("Worker failed to start or encountered a fatal error:", err);
  process.exit(1);
});
