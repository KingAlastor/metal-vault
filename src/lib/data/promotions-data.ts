"use server";

import sql from "../db";

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
