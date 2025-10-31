"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getAnalyticsSessionId,
  refreshAnalyticsSessionTimestamp,
} from "./get-analytics-session-id";

interface EventData {
  path: string;
  event: string;
  ts: number;
  data?: Record<string, unknown>;
}

/**
 * Tracks anonymous per-session analytics.
 * Buffers events in memory and flushes via navigator.sendBeacon().
 * Keeps session alive on user activity.
 */
export function AnalyticsTracker({ isUser }: { isUser: boolean }) {
  const pathname = usePathname();
  const sessionId = useRef<string>(getAnalyticsSessionId());
  const sessionStart = useRef<number>(Date.now());
  const events = useRef<EventData[]>([]);
  const clickedSignin = useRef<boolean>(false);
  const lastFlush = useRef<number>(Date.now());

  const FLUSH_INTERVAL = 60_000; // 60s
  const FLUSH_URL = "/api/analytics/flush";

  // ------------------------
  // Keep session alive on user activity
  // ------------------------
  useEffect(() => {
    const refresh = () => refreshAnalyticsSessionTimestamp();
    ["click", "scroll", "keydown", "mousemove"].forEach((evt) =>
      window.addEventListener(evt, refresh)
    );
    return () => {
      ["click", "scroll", "keydown", "mousemove"].forEach((evt) =>
        window.removeEventListener(evt, refresh)
      );
    };
  }, []);

  // ------------------------
  // Track pageviews automatically
  // ------------------------
  useEffect(() => {
    events.current.push({ path: pathname, event: "pageview", ts: Date.now() });
    refreshAnalyticsSessionTimestamp();
  }, [pathname]);

  // ------------------------
  // Global analytics API
  // ------------------------
  useEffect(() => {
    (window as any).analytics = {
      trackSigninClick: (data: { provider: string }) => {
        clickedSignin.current = true;
        events.current.push({
          path: pathname,
          event: "signin_click",
          ts: Date.now(),
          data,
        });
        refreshAnalyticsSessionTimestamp();
      },
      trackEvent: (name: string) => {
        events.current.push({ path: pathname, event: name, ts: Date.now() });
        refreshAnalyticsSessionTimestamp();
      },
    };
  }, [pathname]);

  // ------------------------
  // Flush analytics helper
  // ------------------------
  const flushAnalytics = (reason: string) => {
    if (events.current.length === 0) return;

    const payload = {
      sessionId: sessionId.current,
      isUser,
      startedAt: sessionStart.current,
      endedAt: Date.now(),
      clickedSignin: clickedSignin.current,
      reason,
      events: events.current,
    };

    events.current = []; // clear buffer
    lastFlush.current = Date.now();

    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(FLUSH_URL, blob);
    } catch (err) {
      console.error("Analytics flush failed:", err);
    }
  };
  // ------------------------
  // Periodic flush every 60s
  // ------------------------
  useEffect(() => {
    const interval = setInterval(
      () => flushAnalytics("periodic"),
      FLUSH_INTERVAL
    );
    return () => clearInterval(interval);
  }, [flushAnalytics]);

  // ------------------------
  // Flush on tab close / visibility change
  // ------------------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flushAnalytics("hidden");
    };
    const handleUnload = () => flushAnalytics("unload");

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [flushAnalytics]);

  return null;
}
