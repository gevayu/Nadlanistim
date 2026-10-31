// Site forms -> the backend's nadlanistim/v1/forms routes (wordpress/nadlanistim-forms.php). Server-side only.
// WordPress validates, saves a draft where the form makes one, and emails the site manager.
import "server-only";
import { headers } from "next/headers";

const WP_URL = process.env.WP_STORE_URL ?? "https://nadlanistim-cms.bold-move.co.il";

export type FormRoute = "job" | "collab" | "nadlanist" | "contact" | "recap";
export type FormState = { ok?: boolean; error?: string };

const FALLBACK = "השליחה לא עברה. נסו שוב בעוד כמה דקות, ואם זה חוזר כתבו לנו ל-hello@nadlanistim.co.il.";

/** Sends the form's text fields. Only the plugin's own errors (code nadlanistim_*) are written for visitors. */
export async function postForm(route: FormRoute, form: FormData): Promise<FormState> {
  // The same secret the backend uses for /api/revalidate; without it WordPress refuses the request.
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error("postForm: REVALIDATE_SECRET is not set");
    return { error: FALLBACK };
  }
  const fields: Record<string, string> = {};
  form.forEach((v, k) => {
    if (typeof v === "string") fields[k] = v;
  });
  // WordPress sees only this server, so the visitor's IP rides along for its rate limit.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "";

  try {
    const res = await fetch(`${WP_URL}/wp-json/nadlanistim/v1/forms/${route}`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "x-nadlanistim-secret": secret, "x-nadlanistim-client-ip": ip },
      body: JSON.stringify(fields),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => null);
    if (typeof body?.code === "string" && body.code.startsWith("nadlanistim_") && body.message) return { error: String(body.message) };
    console.error(`postForm ${route}: HTTP ${res.status}`, body?.code ?? "");
  } catch (e) {
    console.error(`postForm ${route}:`, e);
  }
  return { error: FALLBACK };
}

/**
 * The /join application -> nadlanistim/v1/join-apply (Nadlanistim Headless plugin, already live).
 * WordPress creates a pending subscriber with the details as user meta; the manager approves it in Users.
 * It sends no email and has no honeypot or rate limit of its own, so the honeypot is checked here.
 */
export async function postJoin(form: FormData): Promise<FormState> {
  if (String(form.get("website") ?? "").trim()) return { ok: true };
  const field = (k: string) => String(form.get(k) ?? "").trim();
  const body = { name: field("name"), email: field("email"), phone: field("phone"), field: field("field"), track: field("track"), about: field("about"), consent: field("consent") };
  // The visitor's IP, signed with the shared secret: WordPress keeps it in the consent record and rate-limits by it.
  const secret = process.env.REVALIDATE_SECRET;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "";
  try {
    const res = await fetch(`${WP_URL}/wp-json/nadlanistim/v1/join-apply`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(secret && { "x-nadlanistim-secret": secret, "x-nadlanistim-client-ip": ip }) },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => null);
    // Its own Hebrew messages: missing name / bad email, and an email that is already registered.
    if ((err?.code === "bad_request" || err?.code === "exists") && err.message) return { error: String(err.message) };
    console.error(`postJoin: HTTP ${res.status}`, err?.code ?? "");
  } catch (e) {
    console.error("postJoin:", e);
  }
  return { error: FALLBACK };
}
