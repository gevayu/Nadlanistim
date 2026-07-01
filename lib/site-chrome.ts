// ─── Site chrome configuration ───────────────────────────────────────────────
// Routes listed here use the V6 chrome — the canonical SiteHeader / SiteFooter
// (app/v6/SiteHeader.tsx, app/v6/SiteFooter.tsx). On these routes the legacy
// global header/footer (components/Header, components/Footer) and Background are
// hidden, so the page renders the V6 chrome instead.
//
// To add a new V6-design page:
//   1. Add its route to V6_EXACT_ROUTES below.
//   2. In the page, render <SiteHeader /> at the top and <SiteFooter /> at the
//      bottom (wrap content in `.v6-root`). See app/post-archive/page.tsx.
//
// Legacy pages (/, /v2–/v4, /posts/*, /jobs/*[slug]) keep the existing global
// chrome. Note: V6_EXACT_ROUTES uses EXACT matching so "/jobs" (the new board)
// does NOT capture the legacy "/jobs/bd-project-manager" detail page.

// Version sites — these and their subpaths use V6 chrome.
const V6_PREFIX_ROUTES = ["/v5", "/v6"];

// Standalone V6-design internal pages — matched exactly.
export const V6_EXACT_ROUTES = [
  "/post-archive",
  "/post",
  "/job",
  "/jobs",
  "/profile",
  "/event-recap",
  "/collaborations",
  "/contact",
  "/event",
  "/event-party",
  "/events",
  "/nadlanistim",
];

export function usesV6Chrome(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (V6_PREFIX_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) return true;
  return V6_EXACT_ROUTES.includes(pathname);
}
