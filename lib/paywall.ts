// The paywall: which areas are members-only and what a visitor without a membership gets there.
// Set in WordPress, "הגדרות אתר" → "חומת תשלום" (mu-plugin wordpress/nadlanistim-fields.php). Server-side only.
import { cache } from "react";
import { redirect } from "next/navigation";
import { wpQuery } from "./wp";
import { getSession, safeNext } from "./auth";

/** open: everyone sees it. blur: a guest sees the page with the members' part hidden. redirect: a guest is sent elsewhere. */
export type Access = "open" | "blur" | "redirect";
export type Area =
  | "jobsBoard" | "jobNew" | "collabBoard" | "collabPage" | "collabNew" | "nadlanistPage" | "nadlanistNew"
  // The other inner pages: open to everyone unless the screen says otherwise.
  | "jobPage" | "events" | "eventPage" | "eventRecap" | "directory" | "communities" | "communityPage"
  | "youth" | "youthPage" | "podcast" | "episode" | "knowledge" | "article" | "contact";
type Rule = { access: Access; to: string };

// What the site did before the screen existed; also what it falls back to when WordPress can't be reached.
const DEFAULTS: Record<Area, Rule> = {
  jobsBoard: { access: "open", to: "/join" },
  jobNew: { access: "redirect", to: "/join" },
  collabBoard: { access: "blur", to: "/join" },
  collabPage: { access: "blur", to: "/join" },
  collabNew: { access: "open", to: "/join" },
  nadlanistPage: { access: "blur", to: "/join" },
  nadlanistNew: { access: "redirect", to: "/join" },
  jobPage: { access: "open", to: "/join" },
  events: { access: "open", to: "/join" },
  eventPage: { access: "open", to: "/join" },
  eventRecap: { access: "open", to: "/join" },
  directory: { access: "open", to: "/join" },
  communities: { access: "open", to: "/join" },
  communityPage: { access: "open", to: "/join" },
  youth: { access: "open", to: "/join" },
  youthPage: { access: "open", to: "/join" },
  podcast: { access: "open", to: "/join" },
  episode: { access: "open", to: "/join" },
  knowledge: { access: "open", to: "/join" },
  article: { access: "open", to: "/join" },
  contact: { access: "open", to: "/join" },
};
// Areas whose page has a blurred guest view; anywhere else "blur" can't be picked.
const CAN_BLUR: Area[] = ["collabBoard", "collabPage", "nadlanistPage"];

type WpRule = { access: string | string[] | null; to: string | string[] | null; customUrl: string | null } | null;
type WpPaywall = Record<Area, WpRule> & { joinTo: string | string[] | null; joinCustomUrl: string | null };

const AREAS = Object.keys(DEFAULTS) as Area[];
const RULE = "{ access to customUrl }";
const QUERY = `{ paywallSettings { paywall { ${AREAS.map((a) => `${a} ${RULE}`).join(" ")} joinTo joinCustomUrl } } }`;

// ACF select-like fields come back as a string or a one-item list, depending on the field type.
const one = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const where = (to: string, custom: string | null | undefined, fallback: string) =>
  to === "login" ? "/login" : to === "custom" && custom?.trim() ? custom.trim() : to === "join" ? "/join" : fallback;

export const getPaywall = cache(async (): Promise<{ rules: Record<Area, Rule>; join: string }> => {
  try {
    const p = (await wpQuery<{ paywallSettings: { paywall: WpPaywall | null } | null }>(QUERY)).paywallSettings?.paywall;
    if (!p) return { rules: DEFAULTS, join: "/join" };
    const rules = {} as Record<Area, Rule>;
    for (const a of AREAS) {
      const r = p[a], access = one(r?.access) as Access;
      const ok = access === "open" || access === "redirect" || (access === "blur" && CAN_BLUR.includes(a));
      rules[a] = ok ? { access, to: where(one(r?.to), r?.customUrl, "/join") } : DEFAULTS[a];
    }
    return { rules, join: where(one(p.joinTo), p.joinCustomUrl, "/join") };
  } catch (e) {
    console.error("paywall settings", e);
    return { rules: DEFAULTS, join: "/join" };
  }
});

/** True when this visitor may not see the area's members part: the area isn't open and they aren't a paying member. */
export async function isLocked(area: Area): Promise<boolean> {
  // The session (a cookie read) comes first, always: it keeps every gated page rendered per visitor. Read only when the
  // area is closed, an "open" page would be built once as static HTML and a later switch to members-only would not apply.
  const [session, { rules }] = await Promise.all([getSession(), getPaywall()]);
  return rules[area].access !== "open" && !session?.member;
}

/**
 * For a page: sends a locked visitor away when the area is set to "redirect", otherwise says whether to show the
 * blurred guest view. `next` brings them back after signing in when the destination is the login page.
 */
export async function guard(area: Area, next: string): Promise<{ locked: boolean }> {
  if (!(await isLocked(area))) return { locked: false };
  const rule = (await getPaywall()).rules[area];
  if (rule.access === "redirect") redirect(rule.to === "/login" ? `/login?next=${encodeURIComponent(safeNext(next))}` : rule.to);
  return { locked: true };
}
