// ─── Site chrome ─────────────────────────────────────────────────────────────
// Every page uses the V6 chrome - the canonical SiteHeader / SiteFooter (app/v6/SiteHeader.tsx,
// app/v6/SiteFooter.tsx) - except the legacy /posts/* pages, which keep the old global header/footer
// (components/Header, components/Footer) and Background.
//
// A new page needs no registration here: render <SiteHeader /> at the top and <SiteFooter /> at the
// bottom (or wrap it in app/v6/SiteShell), inside `.v6-root`. See app/post-archive/page.tsx.
//
// The rule is "everything but /posts" rather than a list of V6 routes because a list missed pages: the
// 404 page, and "/" when the host regenerates it in the background (the path then arrives as "/index"
// or not at all), both rendered the old chrome.

export function usesV6Chrome(pathname: string | null | undefined): boolean {
  return !pathname?.startsWith("/posts/");
}
