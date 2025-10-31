const SESSION_KEY = "analyticsSessionId";
const SESSION_TIMESTAMP_KEY = "analyticsSessionTimestamp";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  const now = Date.now();
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  const lastTimestamp = parseInt(
    sessionStorage.getItem(SESSION_TIMESTAMP_KEY) || "0",
    10
  );

  if (!sessionId || now - lastTimestamp > SESSION_TIMEOUT) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
  return sessionId;
}

export function refreshAnalyticsSessionTimestamp() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
}
