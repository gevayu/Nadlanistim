"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import SponsorStrip from "../v6/SponsorStrip";
import "./collaborations.css";
import HiddenName from "./HiddenName";
import { collabRegion, collabTab, type Collab, type CollabTab } from "./data";
import SaveButton from "../v6/SaveButton";
import LazyImg from "../v6/LazyImg";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type FilterKey = "type" | "looking" | "region" | "invest";
type Filters = Record<FilterKey, string>; // "" = no filter

const NO_FILTERS: Filters = { type: "", looking: "", region: "", invest: "" };

type Field = { key: FilterKey; label: string; get: (c: Collab) => string };

const FIELDS: Field[] = [
  { key: "type", label: "סוג", get: (c) => c.type },
  { key: "looking", label: "תפקיד נדרש", get: (c) => c.looking },
  { key: "region", label: "אזור", get: collabRegion },
  { key: "invest", label: "רמת השקעה", get: (c) => c.invest },
];

// Options come from the open tab's listings, so a filter never offers a value no listing there has.
const optionsOf = (collabs: Collab[], f: Field) => [...new Set(collabs.map(f.get).filter(Boolean))];

export default function CollabBoard({ collabs, tabs, locked }: { collabs: Collab[]; tabs: CollabTab[]; locked: boolean }) {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const inTab = collabs.filter((c) => collabTab(c) === tabs[tab]?.key);
  const shown = inTab.filter((c) => FIELDS.every((f) => !filters[f.key] || f.get(c) === filters[f.key]));
  // A filter with nothing to choose from is hidden.
  const selects = FIELDS.map((f) => ({ ...f, options: optionsOf(inTab, f) })).filter((f) => f.options.length > 0);

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
              {tabs.map(({ key, label }, i) => (
                <button
                  key={key}
                  type="button"
                  className={`co-tab${i === tab ? " is-active" : ""}`}
                  onClick={() => { setTab(i); setFilters(NO_FILTERS); }}
                >{label}</button>
              ))}
            </div>

            <div className="co-selects">
              {selects.map((f) => (
                <select
                  key={f.key}
                  className="pg-select"
                  aria-label={f.label}
                  value={filters[f.key]}
                  onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                >
                  <option value="">{f.label}</option>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>

          {shown.length === 0 && <p className="pg-empty">לא נמצאו שיתופי פעולה שמתאימים לסינון.</p>}

          <div className="pg-grid">
            {shown.map((c) => (
              <a key={c.slug} href={`/collaboration/${c.slug}`} className="pg-card v6-glass" data-reveal>
                <SaveButton variant="card" path={`/collaboration/${c.slug}`} title={c.title} />
                {c.img && (
                  <figure className="pg-card__cover">
                    <LazyImg src={c.img} alt="" />
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
                  <span className="pg-card__date">{locked ? <>פורסם ע״י <HiddenName /></> : c.by && `פורסם ע״י ${c.by}`}</span>
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

      <SponsorStrip slot="events" />
    </SiteShell>
  );
}
