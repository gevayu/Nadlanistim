"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import "./collaborations.css";
import { COLLABS } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TABS = ["מחפש שותף", "פרויקטים פעילים", "סיפורי הצלחה"];

const FILTERS: { label: string; options: string[] }[] = [
  { label: "סוג", options: ["סוג", "קרקע", "בנייה", "שיפוצים", "השקעות", "טכנולוגיה"] },
  { label: "תפקיד נדרש", options: ["תפקיד נדרש", "שותף פיננסי", "שותף מקצועי", "קבלן", "יועץ"] },
  { label: "אזור", options: ["אזור", "צפון", "מרכז", "דרום", "ירושלים", "כל הארץ"] },
  { label: "רמת השקעה", options: ["רמת השקעה", "עד 100K", "עד 500K", "מיליון+", "ללא השקעה כספית"] },
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

          {/* Refined controls panel */}
          <div className="co-controls v6-glass" data-reveal>
            <div className="co-tabs">
              {TABS.map((t, i) => (
                <button key={t} type="button" className={`co-tab${i === tab ? " is-active" : ""}`} onClick={() => setTab(i)}>{t}</button>
              ))}
            </div>

            <div className="co-selects">
              {FILTERS.map((f) => (
                <select key={f.label} className="pg-select" aria-label={f.label} defaultValue={f.options[0]}>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
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
                  <a href={`/collaboration/${c.slug}`} className="v6-btn v6-btn--primary" style={{ padding: "10px 18px", fontSize: 13.5 }}>
                    <span>פרטים נוספים</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/collaboration-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
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
