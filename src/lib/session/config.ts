import { SessionOptions } from 'iron-session'

export interface SessionData {
  userId?: string;
  userShard?: string;
  isLoggedIn: boolean;
  refreshToken?: string;
  // Add any other session data you need
}

export const sessionOptions: SessionOptions = {
  cookieName: "metal-vault-session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}
