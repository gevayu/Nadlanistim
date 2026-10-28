"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import { JOBS, JOB_KINDS, type Job } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type FilterKey = "kind" | "date" | "place" | "field" | "type";
type Filters = Record<FilterKey, string>; // "" = no filter

const NO_FILTERS: Filters = { kind: "", date: "", place: "", field: "", type: "" };

// Options come from the listings themselves, so a filter can never offer a value no listing has.
const optionsOf = (k: "place" | "field" | "type"): [string, string][] =>
  [...new Set(JOBS.map((j) => j[k]))].map((v) => [v, v]);

const FILTERS: { key: FilterKey; label: string; all: string; options: [string, string][] }[] = [
  { key: "kind", label: "סוג פרסום", all: "כל הפרסומים", options: Object.entries(JOB_KINDS) },
  { key: "date", label: "תאריך פרסום", all: "הכל", options: [["7", "השבוע"], ["30", "החודש"]] },
  { key: "place", label: "מיקום", all: "כל המיקומים", options: optionsOf("place") },
  { key: "field", label: "תחום עיסוק", all: "כל התחומים", options: optionsOf("field") },
  { key: "type", label: "סוג משרה", all: "כל הסוגים", options: optionsOf("type") },
];

const daysAgo = (date: string) => {
  const [d, m, y] = date.split(".").map(Number);
  return (Date.now() - new Date(y, m - 1, d).getTime()) / 86_400_000;
};

const matches = (j: Job, f: Filters) =>
  (!f.kind || j.kind === f.kind) &&
  (!f.date || daysAgo(j.date) <= Number(f.date)) &&
  (!f.place || j.place === f.place) &&
  (!f.field || j.field === f.field) &&
  (!f.type || j.type === f.type);

export default function JobsPage() {
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [applied, setApplied] = useState<Filters>(NO_FILTERS);
  const shown = JOBS.filter((j) => matches(j, applied));

  return (
    <SiteShell>

      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>לוח דרושים — <em>הזדמנויות בקהילה שלנו</em></h1>
            <p>החזון שלנו הוא לחבר בין אנשים בקהילה, לפתוח דלתות ולהציע את הזה לזה. כאן תוכלו למצוא הזדמנויות עבודה, לפרסם שאתם מחפשים עבודה, להציע שירותים, למצוא שותפים עסקיים ואף להתנדב בפרויקטים קהילתיים — הכל מתוך אמון וקשר שכבר קיימים בקהילה.</p>
          </div>

          <form className="pg-toolbar" data-reveal onSubmit={(e) => { e.preventDefault(); setApplied(draft); }}>
            {FILTERS.map((f) => (
              <select
                key={f.key}
                className="pg-select"
                aria-label={f.label}
                value={draft[f.key]}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              >
                <option value="">{f.all}</option>
                {f.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            ))}
            <button type="submit" className="v6-btn v6-btn--primary" style={{ padding: "11px 26px", fontSize: 13.5 }}>סינון</button>
          </form>

          {shown.length === 0 && <p className="pg-empty">לא נמצאו מודעות שמתאימות לסינון.</p>}

          <div className="pg-grid">
            {shown.map((j) => (
              <a key={j.id} href="/job" className="pg-card v6-glass" data-reveal>
                <div className="pg-card__top">
                  <span className="pg-card__id">מס׳ {j.id}</span>
                  {j.kind === "seek" && <span className="pg-stage">{JOB_KINDS.seek}</span>}
                </div>
                <h3 className="pg-card__title">{j.title}</h3>
                <div className="pg-card__by">מפרסם: <b>{j.by}</b></div>
                <div className="pg-card__rows">
                  <div><b>סוג עבודה:</b>{j.type}</div>
                  <div><b>מיקום:</b>{j.place}</div>
                </div>
                <p className="pg-card__desc">{j.desc}</p>
                <div className="pg-card__foot">
                  <span className="pg-card__date">פורסם: {j.date}</span>
                  <span className="v6-btn v6-btn--primary" style={{ padding: "10px 18px", fontSize: 13.5 }}>
                    <span>פרטים נוספים</span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/job-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>פרסם משרה פתוחה — חינם לחברי הקהילה</span>
              <ArrowIcon />
            </a>
            <a href="/job-new?kind=seek" className="v6-btn v6-btn--glass v6-btn--lg">פרסם שאתה מחפש עבודה</a>
            <a href="/#contact" className="v6-btn v6-btn--glass v6-btn--lg">הצטרף לקהילה וקבל גישה מלאה</a>
            <a href="/profile" className="v6-btn v6-btn--glass v6-btn--lg">הצג את השירותים שלך</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
