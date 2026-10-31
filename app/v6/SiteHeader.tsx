"use client";

import { useEffect, useState } from "react";
import FavButton from "./FavButton";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Canonical V6 header links (absolute so they work from any route).
const NAV_LINKS: [string, string][] = [
  ["/#about", "מי אנחנו?"],
  ["/nadlanistim", "הכר את הנדלניסט"],
  ["/#articles", "תוכן מקצועי"],
  ["/#events", "אירועים"],
  ["/#podcast", "פודקאסט"],
  ["/#dealroom", "חדר העסקאות"],
  ["/#stories", "קריירה"],
  ["/contact", "צרו קשר"],
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

// The members button: "Members Only" to the login page, or "החשבון שלי" to the personal area once signed in.
// The httpOnly session cookie is out of the browser's reach, so lib/auth.ts sets this readable flag next to it
// (SIGNED_IN_COOKIE).
export function useMembersLink() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(/(?:^|;\s*)nad_signed_in=1(?:;|$)/.test(document.cookie));
  }, []);
  return { href: signedIn ? "/account" : "/login", long: signedIn ? "החשבון שלי" : "Members Only", short: signedIn ? "החשבון שלי" : "Members" };
}

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrolled = useScrolled();
  const members = useMembersLink();

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
      <a href="#main" className="v6-skip">דלג לתוכן</a>
      <header className={`v6-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="v6-nav__inner v6-glass">
          <button className="v6-nav__menu" aria-label="פתח תפריט" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <a href="/" className="v6-nav__logo" aria-label="הנדלניסטים - דף הבית">
            <img src="/v6-assets/logo-360.png" width={360} height={114} alt="הנדלניסטים" />
          </a>
          <nav className="v6-nav__links" aria-label="ניווט ראשי">
            {NAV_LINKS.map(([href, label]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <FavButton />
          <a href={members.href} className="v6-btn v6-btn--primary v6-nav__cta" data-magnetic="">
            <span className="v6-nav__cta-long">{members.long}</span>
            <span className="v6-nav__cta-short">{members.short}</span>
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
          <a href={members.href} className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block v6-drawer__cta" onClick={closeDrawer}>
            <span>{members.long}</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </>
  );
}
