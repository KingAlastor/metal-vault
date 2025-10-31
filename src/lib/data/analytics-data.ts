"use server";

import { sql } from "../db";

export interface EventData {
  path: string;
  event: string;
  ts: number;
  data?: any;
}

export interface AnalyticsSessionData {
  sessionId: string;
  isUser?: boolean;
  startedAt: number;
  endedAt: number;
  clickedSignin?: boolean;
  flush_reason?: string;
  events: EventData[];
}

export async function saveAnalyticsSession(data: AnalyticsSessionData) {
  const {
    sessionId,
    isUser = false,
    startedAt,
    endedAt,
    clickedSignin = false,
    flush_reason = null,
    events,
  } = data;

  await sql.begin(async (tx) => {
    // Insert or update session
    await tx`
      INSERT INTO analytics_sessions
        (session_id, is_user, started_at, ended_at, clicked_signin, flush_reason)
      VALUES
        (${sessionId}, ${isUser}, to_timestamp(${startedAt} / 1000.0), to_timestamp(${endedAt} / 1000.0), ${clickedSignin}, ${flush_reason})
      ON CONFLICT (session_id) DO UPDATE
        SET ended_at = excluded.ended_at,
            clicked_signin = excluded.clicked_signin,
            flush_reason = excluded.flush_reason;
    `;

    // Insert events safely
    for (const event of events) {
      console.log("events: ", event);
      await tx.unsafe(
        `INSERT INTO analytics_events (session_id, path, event, created_at, data)
         VALUES ($1, $2, $3, to_timestamp($4 / 1000.0), $5)`,
        [sessionId, event.path, event.event, event.ts, event.data ?? null]
      );
    }
  });
}
