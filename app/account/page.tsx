import SiteShell from "../v6/SiteShell";
import "./account.css";
import { onBoard } from "../collaborations/data";
import { getCollabs } from "../collaborations/wp";
import { eventHref, isVolunteer } from "../events/data";
import { getEvents } from "../events/wp";
import { getJobs } from "../jobs/wp";
import { CURRENT_MEMBER } from "../nadlanistim/data";
import { getNadlanistim } from "../nadlanistim/wp";
import { getEpisodes } from "../podcast/wp";

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// "יולי 2025" from the ISO date WordPress stores.
const monthYear = (iso: string) => new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
const dot = (...parts: string[]) => parts.filter(Boolean).join(" · ");

export default async function AccountPage() {
  const [people, collabs, jobs, events, episodes] = await Promise.all([getNadlanistim(), getCollabs(), getJobs(), getEvents(), getEpisodes()]);
  const me = people.find((n) => n.slug === CURRENT_MEMBER);
  const deals = collabs.filter(onBoard);
  const past = events.filter((e) => e.past && !isVolunteer(e)).sort((a, b) => b.date.localeCompare(a.date));
  const quick = [
    { ic: "🤝", t: "עסקאות בלעדיות", n: `${deals.length} פעילות`, href: "/collaborations" },
    { ic: "💼", t: "משרות לחברים", n: `${jobs.length} פתוחות`, href: "/jobs" },
    { ic: "🪩", t: "מסיבות והקלטות", n: `${past.length} אירועים`, href: "/events" },
    { ic: "🎙️", t: "פרקים מלאים", n: `${episodes.length} פרקים`, href: "/podcast" },
  ];

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          {/* Account header */}
          <div className="ac-head v6-glass" data-reveal>
            <div className="ac-head__av">{me?.photo && <img src={me.photo} alt="" />}</div>
            <div>
              <div className="ac-head__name">שלום, {me?.name} 👋</div>
              {me?.role && <div className="ac-head__meta">{me.role}</div>}
            </div>
            <span className="ac-head__badge">MEMBERS ONLY ✓</span>
            <a href="/my-account" className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>עריכת הפרופיל שלי</a>
          </div>

          {/* Quick access */}
          <div className="ac-quick">
            {quick.map((q) => (
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
              {deals.slice(0, 3).map((d) => (
                <a key={d.slug} href={`/collaboration/${d.slug}`} className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">🤝</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{d.title}</div>
                    <div className="ac-row__meta">{dot(d.looking && `מחפש: ${d.looking}`, d.place, d.invest)}</div>
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
              {jobs.slice(0, 3).map((j) => (
                <a key={j.id} href={`/job/${j.id}`} className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">💼</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{j.title}</div>
                    <div className="ac-row__meta">{dot(j.company || j.by, j.place)}</div>
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
              {past.slice(0, 3).map((p) => (
                <a key={p.slug} href={eventHref(p)} className="ac-row v6-glass" data-reveal>
                  <div className="ac-row__ic">🎉</div>
                  <div className="ac-row__body">
                    <div className="ac-row__title">{p.title}</div>
                    <div className="ac-row__meta">{dot(monthYear(p.date), p.place)}</div>
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
