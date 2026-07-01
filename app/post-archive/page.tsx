"use client";

import { useEffect } from "react";
import "../v6/v6.css";
import "./post-archive.css";
import SiteHeader from "../v6/SiteHeader";
import SiteFooter from "../v6/SiteFooter";

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

type Post = {
  img: string;
  type: string;
  cat: string;
  read: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
};

const POSTS: Post[] = [
  { img: "1486406146926-c627a92ad1ab", type: "מדריך", cat: "מיסוי", read: "9 דק׳", title: "מיסוי מקרקעין 2026 — מה השתנה ולמי זה משנה", excerpt: "כל מה שמשקיעים ובעלי דירות צריכים להבין על מס שבח, מס רכישה והפטורים החדשים.", author: "עו״ד דניאל כהן", date: "יוני 2026" },
  { img: "1554469384-e58fac16e23a", type: "הסבר", cat: "מימון", read: "6 דק׳", title: "איך קוראים דוח אפס בלי ללכת לאיבוד", excerpt: "המספרים שקובעים אם פרויקט שווה — ואיך לזהות אם ההנחות שמאחוריהם ריאליות.", author: "רן מימון", date: "מאי 2026" },
  { img: "1545324418-cc1a3fa10c00", type: "מדריך", cat: "משפט", read: "11 דק׳", title: "התחדשות עירונית: פינוי־בינוי מול תמ״א 38", excerpt: "ההבדלים שמשנים תשואה — מסלולים, סיכונים ולוחות זמנים שכדאי להכיר מראש.", author: "עו״ד דניאל כהן", date: "מאי 2026" },
  { img: "1518770660439-4636190af475", type: "מחקר", cat: "טכנולוגיה", read: "5 דק׳", title: "פרופטק — חמש פלטפורמות ששווה להכיר", excerpt: "הכלים הדיגיטליים שמקצרים את הדרך מאיתור הזדמנות ועד סגירת עסקה.", author: "שירה אלוני", date: "אפריל 2026" },
  { img: "1582407947304-fd86f028f716", type: "Case Study", cat: "השקעות", read: "8 דק׳", title: "השקעה בפריפריה — מתי זה משתלם באמת", excerpt: "ניתוח של עסקה אמיתית: איפה הרווח האמיתי מסתתר ומה כמעט הפיל אותה.", author: "ד״ר ענת רוזנברג", date: "אפריל 2026" },
  { img: "1556761175-5973dc0f32e7", type: "מדריך", cat: "ניהול נכסים", read: "7 דק׳", title: "ניהול נכסים מרחוק — המדריך המעשי", excerpt: "תהליכים, כלים ואנשים שמאפשרים לנהל תיק נכסים בלי להיות בשטח כל יום.", author: "נועה ברגר", date: "מרץ 2026" },
];

const FILTERS: { title: string; color: string; items: string[] }[] = [
  { title: "לפי נושא", color: "blue", items: ["מיסוי", "משפט", "מימון", "שיווק", "טכנולוגיה", "ניהול נכסים", "השקעות"] },
  { title: "לפי רמה", color: "green", items: ["בסיסי", "מתקדם", "מומחה"] },
  { title: "לפי סוג", color: "purple", items: ["מדריך", "הסבר", "מחקר", "Case Study"] },
  { title: "לפי משך קריאה", color: "amber", items: ["3 דקות", "5-7 דקות", "10+ דקות"] },
];

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

export default function PostArchive() {
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

      <main style={{ paddingTop: "140px" }}>
        {/* Sponsorship strip */}
        <section className="v6-section">
          <div className="v6-container">
            <div className="v6-sponsorstrip v6-glass" data-reveal>
              <span className="v6-sponsorstrip__title">Sponsorship#1</span>
            </div>
          </div>
        </section>

        {/* Archive */}
        <section className="v6-section">
          <div className="v6-container">
            <div className="pa-head" data-reveal>
              <h1>בית הידע <em>| תוכן מקצועי שמקדם</em></h1>
              <p>כי ידע זה לא רק כוח, זה גם רווח. מאמרים מעמיקים, מדריכים מקצועיים והסברים של אמת.</p>
            </div>

            <div className="pa-layout">
              <aside className="pa-side v6-glass" data-reveal>
                {FILTERS.map((f) => (
                  <div className="pa-filter" key={f.title}>
                    <div className="pa-filter__title">{f.title}</div>
                    <div className="pa-filter__pills">
                      {f.items.map((it) => (
                        <button type="button" key={it} className={`pa-pill pa-pill--${f.color}`}>{it}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </aside>

              <div className="pa-grid">
                {POSTS.map((p) => (
                  <article key={p.title} className="pa-card v6-glass" data-reveal>
                    <figure className="pa-card__img">
                      <img src={`https://images.unsplash.com/photo-${p.img}?w=900&q=80`} alt="" />
                      <span className="pa-card__type">{p.type}</span>
                    </figure>
                    <div className="pa-card__body">
                      <div className="pa-card__top">
                        <span>{p.cat}</span>
                        <span className="pa-dot" />
                        <ClockIcon /><span>{p.read}</span>
                      </div>
                      <h3 className="pa-card__title">{p.title}</h3>
                      <p className="pa-card__excerpt">{p.excerpt}</p>
                      <a href="#" className="pa-card__more"><span>קרא עוד</span><ArrowIcon /></a>
                      <div className="pa-card__meta">
                        <span>{p.author}</span><span className="pa-sep">·</span>
                        <span>{p.date}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="pa-cta" data-reveal>
              <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                <span>רוצה לתרום לבית הידע? שלח לנו מאמר מקצועי</span>
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        {/* Sponsorship strip */}
        <section className="v6-section">
          <div className="v6-container">
            <div className="v6-sponsorstrip v6-glass" data-reveal>
              <span className="v6-sponsorstrip__title">Sponsorship#2</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
