"use server";

import { makeWorkerUtils } from "graphile-worker";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

export async function triggerAllBandsSync() {
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }
  const workerUtils = await makeWorkerUtils({ connectionString });
  await workerUtils.addJob("sync_all_bands", {});
  console.log("Job 'sync_all_bands' added to the queue.");
}

export async function triggerLatestBandsSync() {
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }
  // Note: 'sync_latest_bands' is currently commented out in the worker, this will fail until uncommented.
  const workerUtils = await makeWorkerUtils({ connectionString });
  await workerUtils.addJob("sync_latest_bands", {});
  console.log("Job 'sync_latest_bands' added to the queue.");
}

export async function triggerAlbumsSync() {
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }
  const workerUtils = await makeWorkerUtils({ connectionString });
  await workerUtils.addJob("sync_albums", {});
  console.log("Job 'sync_albums' added to the queue.");
}

export async function triggerUpcomingReleasesSync() {
    if (!connectionString) {
        throw new Error("DATABASE_URL not set");
    }
    const workerUtils = await makeWorkerUtils({ connectionString });
    await workerUtils.addJob("sync_upcoming_releases", {});
    console.log("Job 'sync_upcoming_releases' added to the queue.");
}
