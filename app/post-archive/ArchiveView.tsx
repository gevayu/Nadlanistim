"use client";

import { useEffect, useState } from "react";
import "../v6/v6.css";
import "./post-archive.css";
import SiteHeader from "../v6/SiteHeader";
import SponsorStrip from "../v6/SponsorStrip";
import Breadcrumbs from "../v6/Breadcrumbs";
import SiteFooter from "../v6/SiteFooter";
import type { Article } from "./data";
import SaveButton from "../v6/SaveButton";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" strokeLinecap="round" />
  </svg>
);

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

/** `filter` is the ?cat= / ?tag= the server already applied; the search box narrows further. */
export default function ArchiveView({ posts, filter }: { posts: Article[]; filter?: string }) {
  useRevealOnScroll();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (p: Article) => !q || [p.title, p.excerpt, ...p.cats, p.type, p.author.name].some((t) => t.toLowerCase().includes(q));
  const found = posts.filter(matches).length;

  return (
    <div className="v6-root">
      <div className="v6-ambient" aria-hidden>
        <div className="v6-ambient__orb v6-ambient__orb--1" />
        <div className="v6-ambient__orb v6-ambient__orb--2" />
        <div className="v6-ambient__orb v6-ambient__orb--3" />
        <div className="v6-ambient__grain" />
      </div>

      <SiteHeader />

      <main style={{ paddingTop: "140px" }} id="main">
        <Breadcrumbs />
        <SponsorStrip />

        {/* Archive */}
        <section className="v6-section">
          <div className="v6-container">
            <div className="pa-head" data-reveal>
              <h1>מרכז הידע <em>| {filter ?? "תוכן מקצועי שמקדם"}</em></h1>
              <p>כי ידע זה לא רק כוח, זה גם רווח. מאמרים מעמיקים, מדריכים מקצועיים והסברים של אמת.</p>
            </div>

            <div className="pa-search-wrap" data-reveal>
              <input
                type="search"
                className="pa-search"
                placeholder="חיפוש מאמר, נושא או כותב…"
                aria-label="חיפוש במרכז הידע"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {found === 0 && <p className="pa-empty">{q ? `לא נמצאו מאמרים עבור ״${query.trim()}״.` : "לא נמצאו מאמרים."}</p>}

            <div className="pa-grid">
              {posts.map((p) => (
                <a key={p.slug} href={`/article/${p.slug}`} className="pa-card v6-glass" data-reveal hidden={!matches(p)}>
                  <SaveButton variant="card" path={`/article/${p.slug}`} title={p.title} />
                  {p.img && (
                    <figure className="pa-card__img">
                      <img loading="lazy" src={p.img} alt="" />
                      {p.type && <span className="pa-card__type">{p.type}</span>}
                    </figure>
                  )}
                  <div className="pa-card__body">
                    <div className="pa-card__top">
                      {p.cats[0] && <><span>{p.cats[0]}</span><span className="pa-dot" /></>}
                      <ClockIcon /><span>{p.minutes} דק׳</span>
                    </div>
                    <h3 className="pa-card__title">{p.title}</h3>
                    {p.excerpt && <p className="pa-card__excerpt">{p.excerpt}</p>}
                    <span className="pa-card__more"><span>קרא עוד</span><ArrowIcon /></span>
                    <div className="pa-card__meta">
                      {p.author.name && <><span>{p.author.name}</span><span className="pa-sep">·</span></>}
                      <span>{p.date}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="pa-cta" data-reveal>
              <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                <span>רוצה לתרום למרכז הידע? שלח לנו מאמר מקצועי</span>
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

      <SponsorStrip slot="events" />
      </main>

      <SiteFooter />
    </div>
  );
}
