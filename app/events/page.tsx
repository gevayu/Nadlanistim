import SiteShell from "../v6/SiteShell";
import { eventHref, featuredEvent, heDate, isVolunteer, metaLine, type EventItem } from "./data";
import { getEvents } from "./wp";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const unique = (list: string[]) => [...new Set(list.filter(Boolean))];

function EvCard({ e }: { e: EventItem }) {
  return (
    <a href={eventHref(e)} className="pg-imgcard v6-glass" data-reveal>
      {e.img && <figure className="pg-imgcard__img"><img src={e.img} alt="" /></figure>}
      <div className="pg-imgcard__body">
        <div className="pg-imgcard__meta">{metaLine(heDate(e.date), e.place)}</div>
        <h3>{e.title}</h3>
        {e.desc && <p className="pg-imgcard__desc">{e.desc}</p>}
        <span className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>צפו במדיה</span>
      </div>
    </a>
  );
}

export default async function EventsPage() {
  const events = await getEvents();
  const featured = featuredEvent(events);
  const newestFirst = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const past = newestFirst.filter((e) => e.past && !isVolunteer(e));
  const volunteer = newestFirst.filter(isVolunteer);
  // Non-functional for now (as before), but the options are what WordPress actually has.
  const filters = [
    { label: "פילטר לפי שנה", options: ["כל השנים", ...unique(newestFirst.map((e) => e.date.slice(0, 4)))] },
    { label: "פילטר לפי סוג אירוע", options: ["כל הסוגים", ...unique(events.flatMap((e) => e.types))] },
    { label: "פילטר לפי מיקום", options: ["כל המיקומים", ...unique(events.map((e) => e.place))] },
  ];
  return (
    <SiteShell>

      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>נדלניסטים - <em>בשביל האירועים</em></h1>
            <p>כל האירועים שלנו במקום אחד - הקרובים, הקודמים ואירועי ההתנדבות של הקהילה.</p>
          </div>

          <div className="pg-toolbar" data-reveal>
            {filters.map((f) => (
              <select key={f.label} className="pg-select" aria-label={f.label} defaultValue={f.options[0]}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
            <button type="button" className="v6-btn v6-btn--glass" style={{ padding: "11px 22px", fontSize: 13.5 }}>הצג</button>
          </div>

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
            {past.length > 0 && <a href="/event-recap" className="v6-btn v6-btn--glass v6-btn--lg">לרשימת האירועים הקודמים</a>}
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
