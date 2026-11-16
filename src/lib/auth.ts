import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { prisma } from "./db";

export type SessionData = {
  userId?: string;
  epoch?: number;
};

const secret =
  process.env.SESSION_SECRET ?? "liubai-dev-session-secret-please-change-in-production-2026";

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "portfolio_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  if (user.sessionEpoch !== (session.epoch ?? 0)) {
    session.destroy();
    return null;
  }
  return user;
}

export async function requireUser() {
  return getCurrentUser();
}
