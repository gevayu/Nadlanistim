import { notFound } from "next/navigation";
import { CalendarDays, Gift, Handshake, MapPin, Sparkles, Target, Users, UtensilsCrossed, Wallet } from "lucide-react";
import SiteShell from "../v6/SiteShell";
import { heDate, splitTitle } from "../events/data";
import { getEvent } from "../events/wp";
import "./event.css";
import { eventMetadata } from "../events/meta";

export const generateMetadata = eventMetadata("/event");

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>
);

// White line icons (no colour emoji)
const FEATURE_ICONS = { sparkles: Sparkles, target: Target, deal: Handshake, gift: Gift, food: UtensilsCrossed };

// Every block below renders only when WordPress has data for it.
export default async function EventPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const ev = await getEvent("/event", (await searchParams).e);
  if (!ev) notFound();
  const [head, tail] = splitTitle(ev.title);
  const details = [
    { Icon: CalendarDays, label: "מתי", val: heDate(ev.date, true), sub: ev.time },
    { Icon: MapPin, label: "איפה", val: ev.place, sub: "" },
    { Icon: Wallet, label: "כמה עולה", val: ev.price, sub: "" },
    { Icon: Users, label: "למי זה מתאים", val: ev.audience, sub: "" },
  ].filter((d) => d.val || d.sub);
  const sp = ev.speaker;
  return (
    <SiteShell crumb={ev.title}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ev-hero" data-reveal>
            <span className="ev-badge">● אירוע קרוב</span>
            <h1>{head}{tail && <> - <em>{tail}</em></>}</h1>
            {ev.desc && <p>{ev.desc}</p>}
            <a href="#register" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>שמרו לי מקום</span><ArrowIcon /></a>
          </div>
        </div>
      </section>

      {/* Details */}
      {details.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <div className="ev-details">
              {details.map((d) => (
                <div key={d.label} className="ev-detail v6-glass" data-reveal>
                  <div className="ev-detail__icon"><d.Icon strokeWidth={1.6} aria-hidden /></div>
                  <div className="ev-detail__label">{d.label}</div>
                  {d.val && <div className="ev-detail__val">{d.val}</div>}
                  {d.sub && <div className="ev-detail__sub">{d.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {ev.features.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ev-section-title" data-reveal>מה מחכה לכם באירוע?</h2>
            <div className="ev-features">
              {ev.features.map((f) => {
                const Icon = FEATURE_ICONS[f.ic];
                return (
                  <div key={f.t} className="ev-feature" data-reveal>
                    <span className="ev-feature__ic"><Icon strokeWidth={1.6} aria-hidden /></span>
                    <div><b>{f.t}</b>{f.d && <p>{f.d}</p>}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Speaker */}
      {sp && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ev-section-title" data-reveal>מי מעביר - על המנחה</h2>
            <div className="ev-speaker v6-glass" data-reveal>
              {sp.photo && <div className="ev-speaker__img"><img src={sp.photo} alt="" /></div>}
              <div>
                <h3>{sp.name}</h3>
                {sp.role && <div className="ev-speaker__role">{sp.role}</div>}
                {sp.bio && <p>{sp.bio}</p>}
                {sp.quote && <div className="ev-speaker__q">״{sp.quote}״</div>}
                {sp.link && <a href={sp.link} className="ev-speaker__link"><LinkedinIcon /> קראו עוד על {sp.name.split(" ")[0]}</a>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Agenda */}
      {ev.agenda.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ev-section-title" data-reveal>מה התוכנית?</h2>
            <div className="ev-agenda v6-glass" data-reveal style={{ padding: "8px 28px", borderRadius: "var(--r-lg)" }}>
              {ev.agenda.map(({ time, what }) => (
                <div key={time + what} className="ev-agenda__row">
                  <span className="ev-agenda__time">{time}</span>
                  <span className="ev-agenda__what">{what}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {ev.testimonials.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ev-section-title" data-reveal>מה אמרו באירועים הקודמים?</h2>
            <div className="ev-testi">
              {ev.testimonials.map((t) => (
                <article key={t.q} className="ev-testi__card v6-glass" data-reveal>
                  <div className="ev-testi__q">״{t.q}״</div>
                  {t.by && <div className="ev-testi__by">- {t.by}</div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {ev.faq.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ev-section-title" data-reveal>שאלות נפוצות</h2>
            <div className="ev-faq">
              {ev.faq.map((q) => (
                <div key={q} className="ev-faq__item v6-glass" data-reveal><span className="ev-faq__q">?</span>{q}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Register band */}
      <section className="v6-section" id="register">
        <div className="v6-container">
          <div className="ev-band" data-reveal>
            <h2>אל תפספסו את ההזדמנות</h2>
            <a href={ev.cta || "/#contact"} className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>כן, אני רוצה להשתתף</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
