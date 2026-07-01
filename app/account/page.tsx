"use client";

import SiteShell from "../v6/SiteShell";
import "./account.css";
import { COLLABS } from "../collaborations/data";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QUICK = [
  { ic: "🤝", t: "עסקאות בלעדיות", n: "6 פעילות", href: "/collaborations" },
  { ic: "💼", t: "משרות לחברים", n: "6 פתוחות", href: "/jobs" },
  { ic: "🪩", t: "מסיבות והקלטות", n: "עדכני", href: "/event-recap" },
  { ic: "🎙️", t: "פרקים מלאים", n: "12 פרקים", href: "/podcast" },
];

const DEALS = COLLABS.slice(0, 3);

const JOBS = [
  { title: "סמנכ״ל/ית פיתוח עסקי", meta: "קרן השקעות נדל״ן · תל אביב" },
  { title: "שמאי/ת מקרקעין בכיר/ה", meta: "פירמת שמאות מובילה · רמת גן" },
  { title: "מנהל/ת פרויקטים בנדל״ן", meta: "חברה יזמית מובילה · אזור המרכז" },
];

const PARTIES = [
  { ic: "🎉", title: "מסיבת הקיץ 2025 — הקלטות וגלריה", meta: "יולי 2025 · Rooftop TLV", href: "/event-recap" },
  { ic: "🍸", title: "ערב גאלה — 5 שנים לקהילה", meta: "דצמבר 2024 · האנגר 11", href: "/event-recap" },
  { ic: "🎬", title: "כנס הנדלניסטים 2025 — הרצאות מלאות", meta: "מאי 2025 · אקספו ת״א", href: "/event-recap" },
];

export default function AccountPage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          {/* Account header */}
          <div className="ac-head v6-glass" data-reveal>
            <div className="ac-head__av"><img src="https://i.pravatar.cc/160?img=12" alt="" /></div>
            <div>
              <div className="ac-head__name">שלום, אבי כהן 👋</div>
              <div className="ac-head__meta">חבר/ה מאז 2021 · חברות פרימיום פעילה</div>
            </div>
            <span className="ac-head__badge">MEMBERS ONLY ✓</span>
          </div>

          {/* Quick access */}
          <div className="ac-quick">
            {QUICK.map((q) => (
              <a key={q.t} href={q.href} className="ac-ql v6-glass" data-reveal>
                <div className="ac-ql__ic">{q.ic}</div>
                <div className="ac-ql__t">{q.t}</div>
                <div className="ac-ql__n">{q.n}</div>
              </a>
            ))}
          </div>

          {/* Exclusive deals */}
          <div className="ac-section">
            <div className="ac-section__head" data-reveal>
              <h2>עסקאות בלעדיות <span>לחברים בלבד</span></h2>
              <a href="/collaborations" className="v6-link-arrow"><span>לכל העסקאות</span><ChevronIcon /></a>
            </div>
            <div className="ac-list">
              {DEALS.map((d) => (
                <a key={d.slug} href={`/collaboration/${d.slug}`} className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">🤝</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{d.title}</div>
                    <div className="ac-row__meta">מחפש: {d.looking} · {d.place} · {d.invest}</div>
                  </div>
                  <span className="ac-row__arrow"><ChevronIcon /></span>
                </a>
              ))}
            </div>
          </div>

          {/* Careers */}
          <div className="ac-section">
            <div className="ac-section__head" data-reveal>
              <h2>קריירה <span>גישה מוקדמת</span></h2>
              <a href="/jobs" className="v6-link-arrow"><span>לכל המשרות</span><ChevronIcon /></a>
            </div>
            <div className="ac-list">
              {JOBS.map((j) => (
                <a key={j.title} href="/job" className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">💼</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{j.title}</div>
                    <div className="ac-row__meta">{j.meta}</div>
                  </div>
                  <span className="ac-row__arrow"><ChevronIcon /></span>
                </a>
              ))}
            </div>
          </div>

          {/* Past parties & recordings */}
          <div className="ac-section">
            <div className="ac-section__head" data-reveal>
              <h2>מסיבות עבר והקלטות <span>לחברים בלבד</span></h2>
              <a href="/events" className="v6-link-arrow"><span>לכל האירועים</span><ChevronIcon /></a>
            </div>
            <div className="ac-list">
              {PARTIES.map((p) => (
                <a key={p.title} href={p.href} className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">{p.ic}</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{p.title}</div>
                    <div className="ac-row__meta">{p.meta}</div>
                  </div>
                  <span className="ac-row__arrow"><ChevronIcon /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
