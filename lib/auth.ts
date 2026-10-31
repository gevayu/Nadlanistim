// Login and membership, backed by the WordPress mu-plugin wordpress/nadlanistim-auth.php. Server-side only.
// The session is a signed token from WordPress, kept in an httpOnly cookie. Nothing here is cached:
// every page that asks gets the member's state as WordPress sees it now.
import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const WP_URL = process.env.WP_STORE_URL ?? "https://nadlanistim-cms.bold-move.co.il";
const AUTH_API = `${WP_URL}/wp-json/nadlanistim/v1/auth`;

const SESSION_COOKIE = "nad_session";
/** Not secret, readable by the browser: tells the header to point "Members" at /account. */
export const SIGNED_IN_COOKIE = "nad_signed_in";

/** The member's own nadlanist post, as /profile edits it. */
export type OwnedNadlanist = {
  id: number;
  slug: string; // "" until the site manager publishes a new profile
  status: string; // "publish" | "draft" | "pending" ...
  name: string;
  role: string;
  field: string;
  place: string;
  quote: string;
  bio: string[];
  photo: string;
  linkedin: string;
  instagram: string;
  openToWork: boolean;
  communities: string[];
};

export type Session = {
  id: number;
  email: string;
  name: string;
  phone: string;
  /** Clicked the link in the sign-up email. Until then: no membership and no profile. */
  verified: boolean;
  /** A paid membership is active right now. */
  member: boolean;
  /** ISO date the latest paid membership ends, or null if never paid. */
  memberUntil: string | null;
  nadlanist: OwnedNadlanist | null;
};

export type AuthResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const UNAVAILABLE = "ההתחברות לא זמינה כרגע. נסו שוב בעוד כמה דקות.";

/**
 * One call to the WordPress auth API. Never throws: a network failure, timeout or missing route
 * comes back as { ok: false } with a Hebrew message the form can show.
 */
export async function authApi<T>(path: string, init: { method: "GET" | "POST"; token?: string; body?: unknown }): Promise<AuthResult<T>> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const secret = process.env.REVALIDATE_SECRET;
  try {
    const res = await fetch(`${AUTH_API}/${path}`, {
      method: init.method,
      headers: {
        "Content-Type": "application/json",
        ...(init.token && { Authorization: `Bearer ${init.token}`, "X-Nadlanistim-Token": init.token }),
        // Lets WordPress rate-limit per visitor instead of per site server. The secret proves the IP came from us.
        ...(secret && ip && { "X-Nadlanistim-Secret": secret, "X-Nadlanistim-Client-IP": ip }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) return { ok: true, data: json as T };
    // Our own routes answer with a Hebrew `message`; anything else (no route yet, server error) gets the generic one.
    const ours = typeof json?.code === "string" && json.code !== "rest_no_route" && /[֐-׿]/.test(json?.message ?? "");
    return { ok: false, status: res.status, error: ours ? json.message : UNAVAILABLE };
  } catch {
    return { ok: false, status: 0, error: UNAVAILABLE };
  }
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Call from a Server Action only (cookies are read-only while a page renders). */
export async function startSession(token: string, expires: number) {
  const jar = await cookies();
  const base = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: new Date(expires * 1000) };
  jar.set(SESSION_COOKIE, token, { ...base, httpOnly: true });
  jar.set(SIGNED_IN_COOKIE, "1", { ...base, httpOnly: false });
}

/** Call from a Server Action only. */
export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(SIGNED_IN_COOKIE);
}

/** The signed-in user, or null when logged out, the token expired, or WordPress can't be reached. One call per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = await getToken();
  if (!token) return null;
  const res = await authApi<Session>(`me?nc=${Date.now()}`, { method: "GET", token });
  return res.ok && typeof res.data?.id === "number" ? res.data : null;
});

/** Only a same-site path ("/collaboration/x"), never "//evil.com" or a full URL. */
export const safeNext = (next: unknown, fallback = "/account") =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;

/** The session, or a redirect to /login that comes back to `next`. */
export async function requireSession(next: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

/** A paying member's session; logged out goes to /login, logged in without membership goes to /join. */
export async function requireMember(next: string): Promise<Session> {
  const session = await requireSession(next);
  if (!session.member) redirect("/join");
  return session;
}
