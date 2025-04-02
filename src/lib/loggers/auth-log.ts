type AuthLogType = 'not_logged_in' | 'wrong_user' | 'invalid_token' | 'expired_session';

interface AuthLogData {
  type: AuthLogType;
  requestedUserId?: string;
  sessionUserId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  timestamp?: string;
}

export function logAuthAttempt(data: AuthLogData) {
  const logMessage = {
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // In development, log to console with warning level
  if (process.env.NODE_ENV === 'development') {
    console.warn('Auth Security Event:', logMessage);
  } else {
    // In production, you might want to:
    // 1. Send to a security monitoring service
    // 2. Store in a secure audit log
    // 3. Alert your security team
    console.warn('Auth Security Event:', logMessage);
  }
}

// Helper functions for common auth logging scenarios
export function logUnauthorizedAccess(requestedUserId: string, sessionUserId?: string) {
  logAuthAttempt({
    type: 'not_logged_in',
    requestedUserId,
    sessionUserId,
  });
}

export function logWrongUserAccess(requestedUserId: string, sessionUserId: string) {
  logAuthAttempt({
    type: 'wrong_user',
    requestedUserId,
    sessionUserId,
  });
}

export function logInvalidToken(userId: string) {
  logAuthAttempt({
    type: 'invalid_token',
    requestedUserId: userId,
  });
}

export function logExpiredSession(userId: string) {
  logAuthAttempt({
    type: 'expired_session',
    requestedUserId: userId,
  });
} 