// ─── Site chrome configuration ───────────────────────────────────────────────
// Routes listed here use the V6 chrome - the canonical SiteHeader / SiteFooter
// (app/v6/SiteHeader.tsx, app/v6/SiteFooter.tsx). On these routes the legacy
// global header/footer (components/Header, components/Footer) and Background are
// hidden, so the page renders the V6 chrome instead.
//
// To add a new V6-design page:
//   1. Add its route to V6_EXACT_ROUTES below.
//   2. In the page, render <SiteHeader /> at the top and <SiteFooter /> at the
//      bottom (wrap content in `.v6-root`). See app/post-archive/page.tsx.
//
// Legacy pages (/posts/*) keep the existing global chrome.
// /jobs/<slug> only forwards a WordPress link to /job/<serial>.

// Prefix routes - these and their subpaths use V6 chrome (dynamic detail routes). Matched as exact OR `route + "/..."`, so "/collaboration"
// covers "/collaboration/[slug]" but NOT "/collaborations" or "/collaboration-new".
const V6_PREFIX_ROUTES = ["/collaboration", "/nadlanist", "/podcast", "/community", "/youth", "/job", "/article"];

// Standalone V6-design internal pages - matched exactly.
export const V6_EXACT_ROUTES = [
  "/",
  "/post-archive",
  "/post",
  "/job",
  "/jobs",
  "/jobs-locked",
  "/job-new",
  "/join",
  "/nadlanist-new",
  "/profile",
  "/event-recap",
  "/collaborations",
  "/collaborations-locked",
  "/collaboration-new",
  "/contact",
  "/event",
  "/event-party",
  "/events",
  "/nadlanistim",
  "/communities",
  "/account",
  "/my-account",
  "/checkout",
  "/thank-you",
  "/login",
  "/register",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/accessibility",
];

export function usesV6Chrome(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (V6_PREFIX_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) return true;
  return V6_EXACT_ROUTES.includes(pathname);
}
