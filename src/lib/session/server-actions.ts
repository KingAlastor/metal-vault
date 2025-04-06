'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './config';

/**
 * Server-side function to get the current session
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

/**
 * Server-side function to destroy the current session
 */
export async function logout() {
  const session = await getSession();
  session.destroy();
  return { success: true };
}

/**
 * Server-side function to update session data
 */
export async function updateSession(data: Partial<SessionData>) {
  const session = await getSession();
  Object.assign(session, data);
  await session.save();
  return session;
} 