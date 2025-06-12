import { Task } from "graphile-worker";
import { syncBandDataFromArchives, syncLatestBandAdditionsFromArchives } from "@/components/user/admin/band-sync";
import { syncAlbumDataFromArchives } from "@/components/user/admin/album-sync";
import { syncUpcomingReleaseDataFromArchives } from "@/lib/data/admin/latest-releases-data-actions";

// Task to sync all bands (potentially long running)
export const syncAllBands: Task = async (payload, helpers) => {
  helpers.logger.info("Starting full band sync from Metal Archives...");
  try {
    await syncBandDataFromArchives();
    helpers.logger.info("Finished full band sync.");
  } catch (error) {
    helpers.logger.error(`Full band sync failed: ${error}`);
    // Re-throw the error so graphile-worker knows the job failed
    throw error;
  }
};

// Task to sync only the latest band additions
export const syncLatestBands: Task = async (payload, helpers) => {
  helpers.logger.info("Starting sync of latest band additions from Metal Archives...");
  try {
    await syncLatestBandAdditionsFromArchives();
    helpers.logger.info("Finished syncing latest band additions.");
  } catch (error) {
    helpers.logger.error(`Syncing latest band additions failed: ${error}`);
    throw error;
  }
};

// Task to sync album data for existing bands
export const syncAlbums: Task = async (payload, helpers) => {
  helpers.logger.info("Starting album sync from Metal Archives...");
  try {
    await syncAlbumDataFromArchives();
    helpers.logger.info("Finished album sync.");
  } catch (error) {
    helpers.logger.error(`Album sync failed: ${error}`);
    throw error;
  }
};

// Task to sync upcoming releases data
export const syncUpcomingReleases: Task = async (payload, helpers) => {
  helpers.logger.info("Starting upcoming releases sync from Metal Archives...");
  try {
    await syncUpcomingReleaseDataFromArchives();
    helpers.logger.info("Finished upcoming releases sync.");
  } catch (error) {
    helpers.logger.error(`Upcoming releases sync failed: ${error}`);
    throw error;
  }
};

// You can add more tasks here by importing other functions
// and wrapping them similarly.