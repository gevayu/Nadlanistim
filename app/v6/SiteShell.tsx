"use client";

import { useEffect } from "react";
import "./v6.css";
import "./pages.css";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SponsorStrip from "./SponsorStrip";
import Breadcrumbs from "./Breadcrumbs";

function useRevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".v6-root [data-reveal]"));
    const byParent = new Map<Element, HTMLElement[]>();
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const list = byParent.get(parent) ?? [];
      list.push(el);
      byParent.set(parent, list);
    });
    byParent.forEach((list) => list.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 8) * 0.06}s`;
    }));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/**
 * Standard V6 chrome wrapper for internal pages: ambient + fixed nav + footer.
 * `crumb` names the current page in the breadcrumbs when only the page knows it (CMS content).
 */
export default function SiteShell({ children, crumb }: { children: React.ReactNode; crumb?: string }) {
  useRevealOnScroll();
  return (
    <div className="v6-root">
      <div className="v6-ambient" aria-hidden>
        <div className="v6-ambient__orb v6-ambient__orb--1" />
        <div className="v6-ambient__orb v6-ambient__orb--2" />
        <div className="v6-ambient__orb v6-ambient__orb--3" />
        <div className="v6-ambient__grain" />
      </div>
      <SiteHeader />
      <main className="pg-wrap">
        <Breadcrumbs current={crumb} />
        <SponsorStrip />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
