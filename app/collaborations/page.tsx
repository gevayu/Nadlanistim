"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Collab = { looking: string; title: string; place: string; invest: string; stage: string; by: string; date: string };

const COLLABS: Collab[] = [
  { looking: "שותף פיננסי", title: "פינוי־בינוי, גבעת שמואל", place: "מרכז", invest: "מיליון+", stage: "תכנון", by: "איתי לבנון", date: "15.11.2023" },
  { looking: "שותף מקצועי", title: "מתחם מסחרי, ראש העין", place: "מרכז", invest: "עד 500K", stage: "רעיון", by: "נועה ברגר", date: "14.11.2023" },
  { looking: "קבלן מבצע", title: "מגדל יוקרה, רמת גן", place: "מרכז", invest: "מיליון+", stage: "ביצוע", by: "רן מימון", date: "13.11.2023" },
  { looking: "יועץ פרופטק", title: "פלטפורמת ניהול נכסים", place: "כל הארץ", invest: "ללא השקעה כספית", stage: "מתקדם", by: "שירה אלוני", date: "12.11.2023" },
  { looking: "שותף לקרקע", title: "קרקע חקלאית להפשרה", place: "צפון", invest: "עד 100K", stage: "רעיון", by: "דוד מזרחי", date: "11.11.2023" },
  { looking: "משקיע שותף", title: "קרן חוב נדל״ן", place: "מרכז", invest: "מיליון+", stage: "תכנון", by: "יואב פרידמן", date: "10.11.2023" },
];

const TABS = ["מחפש שותף", "פרויקטים פעילים", "סיפורי הצלחה"];

const FILTERS: { label: string; color: string; items: string[] }[] = [
  { label: "לפי סוג", color: "blue", items: ["קרקע", "בנייה", "שיפוצים", "השקעות", "טכנולוגיה"] },
  { label: "לפי תפקיד נדרש", color: "purple", items: ["שותף פיננסי", "שותף מקצועי", "קבלן", "יועץ"] },
  { label: "לפי אזור", color: "green", items: ["צפון", "מרכז", "דרום", "ירושלים", "כל הארץ"] },
  { label: "לפי רמת השקעה", color: "amber", items: ["עד 100K", "עד 500K", "מיליון+", "ללא השקעה כספית"] },
];

export default function CollaborationsPage() {
  const [tab, setTab] = useState(0);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#1</span>
          </div>
        </div>
      </section>

      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>בואו נעשה ביחד | <em>שיתופי פעולה עסקיים</em></h1>
            <p>הצלחות הכי גדולות קורות יחד. מצא שותפים, בנה פרויקטים, צמח.</p>
          </div>

          <div className="pg-tabs" data-reveal>
            {TABS.map((t, i) => (
              <button key={t} type="button" className={`pg-tab${i === tab ? " is-active" : ""}`} onClick={() => setTab(i)}>{t}</button>
            ))}
          </div>

          <div className="pg-filterbar" data-reveal>
            {FILTERS.map((f) => (
              <div className="pg-fgroup" key={f.label}>
                <span className="pg-fgroup__label">{f.label}:</span>
                {f.items.map((it) => (
                  <button type="button" key={it} className={`pg-pill pg-pill--${f.color}`}>{it}</button>
                ))}
              </div>
            ))}
          </div>

          <div className="pg-grid">
            {COLLABS.map((c) => (
              <article key={c.title} className="pg-card v6-glass" data-reveal>
                <div className="pg-card__by">מחפש: <b>{c.looking}</b></div>
                <h3 className="pg-card__title">{c.title}</h3>
                <div className="pg-card__rows">
                  <div><b>מיקום:</b>{c.place}</div>
                  <div><b>השקעה נדרשת:</b>{c.invest}</div>
                </div>
                <span className="pg-stage">שלב: {c.stage}</span>
                <div className="pg-card__foot">
                  <span className="pg-card__date">פורסם ע״י {c.by}</span>
                  <a href="/profile" className="v6-btn v6-btn--primary" style={{ padding: "10px 18px", fontSize: 13.5 }}>
                    <span>פרטים נוספים</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>פרסם שיתוף פעולה — חינם לחברי הקהילה</span>
              <ArrowIcon />
            </a>
            <a href="/profile" className="v6-btn v6-btn--glass v6-btn--lg">הצג את הפרויקטים שלך</a>
          </div>
        </div>
      </section>

      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#2</span>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
