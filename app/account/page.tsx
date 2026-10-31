import SiteShell from "../v6/SiteShell";
import "./account.css";
import AccountHead from "./AccountHead";
import FavRemove from "./FavRemove";
import { requireSession } from "../../lib/auth";
import { onBoard } from "../collaborations/data";
import { getCollabs } from "../collaborations/wp";
import { isVolunteer } from "../events/data";
import { getEvents } from "../events/wp";
import { getJobs } from "../jobs/wp";
import { getEpisodes } from "../podcast/wp";
import { getFavorites } from "../../lib/favorites";

const dot = (...parts: string[]) => parts.filter(Boolean).join(" · ");
const day = (iso: string) => new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Jerusalem" }).format(new Date(iso)).replaceAll("/", ".");

// What a saved page is, from its address.
const KINDS: [RegExp, string, string][] = [
  [/^\/collaboration/, "🤝", "עסקה"],
  [/^\/job/, "💼", "משרה"],
  [/^\/event/, "🎉", "אירוע"],
  [/^\/nadlanist\//, "👤", "נדלניסט"],
  [/^\/communit/, "👥", "קהילה"],
  [/^\/(post|article)/, "📰", "כתבה"],
  [/^\/podcast/, "🎙️", "פודקאסט"],
  [/^\/youth/, "🌱", "נבחרת הצעירים"],
];
const OTHER: [RegExp, string, string] = [/./, "📌", "עמוד"];
const kindOf = (path: string) => KINDS.find(([re]) => re.test(path)) ?? OTHER;

export default async function AccountPage() {
  const [session, collabs, jobs, events, episodes, favorites] = await Promise.all([requireSession("/account"), getCollabs(), getJobs(), getEvents(), getEpisodes(), getFavorites()]);
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
          <AccountHead session={session} />

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

          {/* Favorites: what the member saved with the heart in the header, newest first */}
          <div className="ac-section" id="favorites">
            <div className="ac-section__head" data-reveal>
              <h2>המועדפים שלי {favorites.length > 0 && <span>{favorites.length}</span>}</h2>
            </div>
            {favorites.length === 0 ? (
              <p className="ac-empty v6-glass" data-reveal>
                עוד לא שמרתם כלום. בכל עמוד באתר יש לב ליד &quot;החשבון שלי&quot;: לחיצה עליו שומרת את העמוד כאן.
              </p>
            ) : (
              <div className="ac-list">
                {favorites.map((f) => {
                  const [, ic, kind] = kindOf(f.path);
                  return (
                    <div key={f.path} className="ac-row v6-glass" data-reveal>
                      <a href={f.path} className="ac-row__main">
                        <div className="ac-row__ic">{ic}</div>
                        <div className="ac-row__body">
                          <div className="ac-row__title">{f.title}</div>
                          <div className="ac-row__meta">{dot(kind, f.at && `נשמר ב-${day(f.at)}`)}</div>
                        </div>
                      </a>
                      <FavRemove path={f.path} title={f.title} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
