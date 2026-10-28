// WordPress backend (headless, WPGraphQL). Server-side only.
// Every response is cached under one tag; the backend calls /api/revalidate on save to expire it.

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL ?? "https://nadlanistim-cms.bold-move.co.il/graphql";

export const WP_TAG = "wp";

/**
 * Runs a GraphQL query. Content comes only from WordPress, so a failure throws rather than
 * falling back to local copy: Next.js then keeps serving the last page it built from WordPress.
 */
export async function wpQuery<T>(query: string): Promise<T> {
  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    // Safety net if a save hook is ever missed: content is at most an hour stale.
    next: { tags: [WP_TAG], revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`WordPress GraphQL: HTTP ${res.status}`);
  // Site-wide rule: no em dashes. Editors type them in WordPress, so swap them for hyphens on the way in.
  const json = JSON.parse(await res.text(), (_, v) => (typeof v === "string" ? v.replaceAll("\u2014", "-") : v));
  if (json.errors) throw new Error(`WordPress GraphQL: ${json.errors[0]?.message}`);
  return json.data as T;
}

/** Oldest first. Posts created in one batch share a date, so the post ID breaks the tie. */
export const byPublished = (a: { date: string; databaseId: number }, b: { date: string; databaseId: number }) =>
  a.date.localeCompare(b.date) || a.databaseId - b.databaseId;

/** WP datetime ("2023-11-15T09:00:00") -> "15.11.2023", the format the site shows. */
export const wpDate = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");

/** ACF "one item per line" textarea -> list. */
export const wpLines = (s: string | null | undefined) =>
  (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
