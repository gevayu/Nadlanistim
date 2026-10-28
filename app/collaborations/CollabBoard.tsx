"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import "./collaborations.css";
import { COLLAB_TABS, collabRegion, collabTab, type Collab } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type FilterKey = "type" | "looking" | "region" | "invest";
type Filters = Record<FilterKey, string>; // "" = no filter

const NO_FILTERS: Filters = { type: "", looking: "", region: "", invest: "" };

type Field = { key: FilterKey; label: string; get: (c: Collab) => string; always?: string[] };

const FIELDS: Field[] = [
  { key: "type", label: "סוג", get: (c) => c.type },
  // "שותף לעסקת יזמות" is a role on the publish form, so it stays on offer before any listing uses it.
  { key: "looking", label: "תפקיד נדרש", get: (c) => c.looking, always: ["שותף לעסקת יזמות"] },
  { key: "region", label: "אזור", get: collabRegion },
  { key: "invest", label: "רמת השקעה", get: (c) => c.invest },
];

// Options come from the listings themselves, so a filter (bar `always`) never offers a value no listing has.
const optionsOf = (collabs: Collab[], f: Field) => [...new Set([...collabs.map(f.get), ...(f.always ?? [])].filter(Boolean))];

const TABS = Object.entries(COLLAB_TABS);

export default function CollabBoard({ collabs }: { collabs: Collab[] }) {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const shown = collabs.filter(
    (c) => collabTab(c) === TABS[tab][0] && FIELDS.every((f) => !filters[f.key] || f.get(c) === filters[f.key])
  );

  return (
    <SiteShell>

      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>בואו נעשה ביחד | <em>שיתופי פעולה עסקיים</em></h1>
            <p>הצלחות הכי גדולות קורות יחד. מצא שותפים, בנה פרויקטים, צמח.</p>
          </div>

          {/* Refined controls panel */}
          <div className="co-controls v6-glass" data-reveal>
            <div className="co-tabs">
              {TABS.map(([key, label], i) => (
                <button key={key} type="button" className={`co-tab${i === tab ? " is-active" : ""}`} onClick={() => setTab(i)}>{label}</button>
              ))}
            </div>

            <div className="co-selects">
              {FIELDS.map((f) => (
                <select
                  key={f.key}
                  className="pg-select"
                  aria-label={f.label}
                  value={filters[f.key]}
                  onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                >
                  <option value="">{f.label}</option>
                  {optionsOf(collabs, f).map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>

          {shown.length === 0 && <p className="pg-empty">לא נמצאו שיתופי פעולה שמתאימים לסינון.</p>}

          <div className="pg-grid">
            {shown.map((c) => (
              <a key={c.slug} href={`/collaboration/${c.slug}`} className="pg-card v6-glass" data-reveal>
                {c.img && (
                  <figure className="pg-card__cover">
                    <img src={c.img} alt="" loading="lazy" />
                  </figure>
                )}
                {c.looking && <div className="pg-card__by">מחפש: <b>{c.looking}</b></div>}
                <h3 className="pg-card__title">{c.title}</h3>
                {(c.place || c.invest) && (
                  <div className="pg-card__rows">
                    {c.place && <div><b>מיקום:</b>{c.place}</div>}
                    {c.invest && <div><b>השקעה נדרשת:</b>{c.invest}</div>}
                  </div>
                )}
                {c.stage && <span className="pg-stage">שלב: {c.stage}</span>}
                <div className="pg-card__foot">
                  <span className="pg-card__date">{c.by && `פורסם ע״י ${c.by}`}</span>
                  <span className="v6-btn v6-btn--primary" style={{ padding: "10px 18px", fontSize: 13.5 }}>
                    <span>פרטים נוספים</span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/collaboration-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>פרסם שיתוף פעולה - חינם לחברי הקהילה</span>
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
