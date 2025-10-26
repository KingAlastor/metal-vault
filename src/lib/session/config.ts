import { SessionOptions } from 'iron-session'

export interface SessionData {
  userId: string;
  userShard: string;
  refreshToken?: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "metal-vault-session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 90, // 90 days
  },
}
