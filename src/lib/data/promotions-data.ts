"use server";

import { JSONValue } from "postgres";
import sql from "../db";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import { getSession } from "../session/server-actions";

export type Ad = {
  id: string;
  type: "band" | "event";
  filename: string;
};

export async function fetchActiveAds(): Promise<Ad[] | undefined> {
  const ads = (await sql`
    SELECT * FROM ad_details
  `) as Ad[];

  return ads;
}

export async function checkIfActivePromotionExists(id: string, type: string) {
  return await new Promise((resolve) => setTimeout(resolve, 300));
}

export type PromotionFormData = {
  ad_target_id: string;
  ad_target_type: string;
  start_date?: string;
  end_date?: string;
  filename_desktop: string | null;
  filename_mobile: string | null;
  ad_content?: Record<string, JSONValue>;
};

export async function addPromotion(promotionFormData: PromotionFormData) {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown", "addPromotion");
    throw new Error("User must be logged in.");
  }

  try {
    await sql`
      INSERT INTO ad_details (
        ad_target_id,
        ad_target_type,
        user_id,
        total_impressions_available,
        total_impressions,
        start_date,
        end_date,
        filename_desktop,
        filename_mobile,
        ad_content,
        created_at
      ) VALUES (
        ${promotionFormData.ad_target_id},
        ${promotionFormData.ad_target_type},
        ${session.userId},
        100,
        100,
        ${promotionFormData.start_date ?? null},
        ${promotionFormData.end_date ?? null},
        ${promotionFormData.filename_desktop},
        ${promotionFormData.filename_mobile},
        ${
          promotionFormData.ad_content
            ? sql.json(promotionFormData.ad_content)
            : null
        },
        NOW() AT TIME ZONE 'UTC'
      )
    `;
  } catch (error) {
    throw new Error(`Failed to add promotion: ${error}`);
  }
}
