"use client";

import { useEffect, useState } from "react";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Canonical V6 header links (absolute so they work from any route).
const NAV_LINKS: [string, string][] = [
  ["/#about", "מי אנחנו?"],
  ["/#articles", "תוכן מקצועי"],
  ["/#events", "אירועים"],
  ["/#podcast", "פודקאסט"],
  ["/#dealroom", "חדר העסקאות"],
  ["/#stories", "קריירה"],
  ["/#contact", "צרו קשר"],
];

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrolled = useScrolled();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className={`v6-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v6-nav__inner v6-glass">
          <button className="v6-nav__menu" aria-label="פתח תפריט" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="/" className="v6-nav__logo" aria-label="הנדלניסטים — דף הבית">
            <img src="/v6-assets/logo.png" alt="הנדלניסטים" />
          </a>
          <nav className="v6-nav__links" aria-label="ניווט ראשי">
            {NAV_LINKS.map(([href, label]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <a href="/#contact" className="v6-btn v6-btn--primary v6-nav__cta" data-magnetic="">
            <span className="v6-nav__cta-long">Members Only</span>
            <span className="v6-nav__cta-short">Members</span>
            <ArrowIcon />
          </a>
        </div>
      </header>

      <div className={`v6-drawer${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="v6-drawer__veil" onClick={closeDrawer} />
        <div className="v6-drawer__panel">
          <button className="v6-drawer__close" aria-label="סגור" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
          {NAV_LINKS.map(([href, label]) => (
            <a key={label} href={href} className="v6-drawer__link" onClick={closeDrawer}>{label}</a>
          ))}
          <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block v6-drawer__cta" onClick={closeDrawer}>
            <span>Members Only</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </>
  );
}
