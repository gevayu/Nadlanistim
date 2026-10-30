"use client";

import { useEffect, useRef, useState } from "react";
import SiteShell from "../v6/SiteShell";
import SponsorStrip from "../v6/SponsorStrip";
import { eventHref, featuredEvent, heDate, isVolunteer, metaLine, type EventItem } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type FilterKey = "year" | "type" | "place";
type Filters = Record<FilterKey, string>; // "" = no filter

const NO_FILTERS: Filters = { year: "", type: "", place: "" };

const unique = (list: string[]) => [...new Set(list.filter(Boolean))];
const yearOf = (e: EventItem) => e.date.slice(0, 4);

// Options come from the events themselves, so a filter can never offer a value no event has.
const filtersFor = (newestFirst: EventItem[]): { key: FilterKey; label: string; all: string; options: string[] }[] => [
  { key: "year", label: "פילטר לפי שנה", all: "כל השנים", options: unique(newestFirst.map(yearOf)) },
  { key: "type", label: "פילטר לפי סוג אירוע", all: "כל הסוגים", options: unique(newestFirst.flatMap((e) => e.types)) },
  { key: "place", label: "פילטר לפי מיקום", all: "כל המיקומים", options: unique(newestFirst.map((e) => e.place)) },
];

const matches = (e: EventItem, f: Filters) =>
  (!f.year || yearOf(e) === f.year) &&
  (!f.type || e.types.includes(f.type)) &&
  (!f.place || e.place === f.place);

function EvCard({ e }: { e: EventItem }) {
  return (
    <a href={eventHref(e)} className="pg-imgcard v6-glass" data-reveal>
      {e.img && <figure className="pg-imgcard__img"><img src={e.img} alt="" /></figure>}
      <div className="pg-imgcard__body">
        <div className="pg-imgcard__meta">{metaLine(heDate(e.date), e.place)}</div>
        <h3>{e.title}</h3>
        {e.desc && <p className="pg-imgcard__desc">{e.desc}</p>}
        <span className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>{e.past ? "צפו במדיה" : "לפרטים והרשמה"}</span>
      </div>
    </a>
  );
}

export default function EventsBoard({ events }: { events: EventItem[] }) {
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [applied, setApplied] = useState<Filters>(NO_FILTERS);
  const [applyCount, setApplyCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // SiteShell's scroll reveal only sees the elements present on first paint. Cards and sections
  // that a filter brings back are new nodes, so show them right away instead of leaving them at opacity 0.
  useEffect(() => {
    if (!applyCount) return;
    rootRef.current?.closest(".v6-root")?.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => el.classList.add("is-visible"));
  }, [applyCount]);

  const newestFirst = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const filters = filtersFor(newestFirst);
  const pastAll = newestFirst.filter((e) => e.past && !isVolunteer(e));

  const shown = events.filter((e) => matches(e, applied));
  const next = featuredEvent(events);
  const featured = next && matches(next, applied) ? next : undefined;
  const upcoming = shown.filter((e) => !e.past && !isVolunteer(e) && e !== next).sort((a, b) => a.date.localeCompare(b.date));
  const shownNewestFirst = newestFirst.filter((e) => matches(e, applied));
  const past = shownNewestFirst.filter((e) => e.past && !isVolunteer(e));
  const volunteer = shownNewestFirst.filter(isVolunteer);
  const nothing = !featured && !upcoming.length && !past.length && !volunteer.length;

  return (
    <SiteShell>

      <section className="v6-section">
        <div className="v6-container" ref={rootRef}>
          <div className="pg-head" data-reveal>
            <h1>נדלניסטים - <em>בשביל האירועים</em></h1>
            <p>כל האירועים שלנו במקום אחד - הקרובים, הקודמים ואירועי ההתנדבות של הקהילה.</p>
          </div>

          <form className="pg-toolbar" data-reveal onSubmit={(ev) => { ev.preventDefault(); setApplied(draft); setApplyCount((n) => n + 1); }}>
            {filters.map((f) => (
              <select
                key={f.key}
                className="pg-select"
                aria-label={f.label}
                value={draft[f.key]}
                onChange={(ev) => setDraft({ ...draft, [f.key]: ev.target.value })}
              >
                <option value="">{f.all}</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <button type="submit" className="v6-btn v6-btn--glass" style={{ padding: "11px 22px", fontSize: 13.5 }}>הצג</button>
          </form>

          {nothing && <p className="pg-empty">לא נמצאו אירועים שמתאימים לסינון.</p>}

          {/* Featured upcoming */}
          {featured && (
            <>
              <h2 className="pg-subhead" data-reveal>האירוע הקרוב</h2>
              <a href={eventHref(featured)} className="pg-featured v6-glass" data-reveal>
                {featured.img && <div className="pg-featured__img"><img src={featured.img} alt="" /></div>}
                <div className="pg-featured__body">
                  <div className="pg-featured__date">{metaLine(heDate(featured.date), featured.place)}</div>
                  <h3>{featured.title}</h3>
                  {featured.desc && <p>{featured.desc}</p>}
                  <span className="v6-btn v6-btn--primary" data-magnetic="" style={{ alignSelf: "flex-start" }}><span>לפרטים והרשמה</span><ArrowIcon /></span>
                </div>
              </a>
            </>
          )}
        </div>
      </section>

      {/* Other upcoming events, soonest first */}
      {upcoming.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="pg-subhead" data-reveal>אירועים קרובים</h2>
            <div className="pg-grid">
              {upcoming.map((e) => <EvCard key={e.slug} e={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="pg-subhead" data-reveal>אירועים קודמים</h2>
            <div className="pg-grid">
              {past.map((e) => <EvCard key={e.slug} e={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* Volunteer events */}
      <section className="v6-section">
        <div className="v6-container">
          {volunteer.length > 0 && (
            <>
              <h2 className="pg-subhead" data-reveal>אירועי התנדבות</h2>
              <div className="pg-grid">
                {volunteer.map((e) => <EvCard key={e.slug} e={e} />)}
              </div>
            </>
          )}

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>רוצים להיות באירוע הבא? הצטרפו לקהילה</span><ArrowIcon /></a>
            {pastAll.length > 0 && <a href="/event-recap" className="v6-btn v6-btn--glass v6-btn--lg">לרשימת האירועים הקודמים</a>}
          </div>
        </div>
      </section>

      <SponsorStrip slot="events" />
    </SiteShell>
  );
}
