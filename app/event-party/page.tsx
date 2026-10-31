import { guard } from "@/lib/paywall";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Shirt, Ticket } from "lucide-react";
import SiteShell from "../v6/SiteShell";
import { heDate } from "../events/data";
import { getEvent } from "../events/wp";
import Faq from "../events/Faq";
import "./event-party.css";
import { eventMetadata } from "../events/meta";
import SaveButton from "../v6/SaveButton";

export const generateMetadata = eventMetadata("/event-party");

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Every block below renders only when WordPress has data for it.
export default async function EventPartyPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await guard("eventPage", "/events"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const ev = await getEvent("/event-party", (await searchParams).e);
  if (!ev) notFound();
  const details = [
    { Icon: CalendarDays, label: "מתי", val: heDate(ev.date, true), sub: ev.time },
    { Icon: MapPin, label: "איפה", val: ev.place, sub: "" },
    { Icon: Shirt, label: "דרֶס קוד", val: ev.dressCode, sub: "" },
    { Icon: Ticket, label: "כניסה", val: ev.entry, sub: "" },
  ].filter((d) => d.val || d.sub);
  return (
    <SiteShell crumb={ev.title}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ep-herowrap" data-reveal>
            {ev.img && (
              <div className="ep-herowrap__bg">
                <img src={ev.img} alt="" />
              </div>
            )}
            <div className="ep-hero">
              {ev.date && <span className="ep-badge">{heDate(ev.date)}</span>}
              <h1 className="ep-neon">{ev.title}</h1>
              <SaveButton title={ev.title} />
              {ev.desc && <p>{ev.desc}</p>}
              <div className="ep-hero__cta">
                <a href="#register" className="v6-btn v6-btn--lg ep-btn--party" data-magnetic=""><span>שריינו מקום</span><ArrowIcon /></a>
                {ev.lineup.length > 0 && <a href="#lineup" className="v6-btn v6-btn--glass v6-btn--lg">מי על הדקים?</a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vibe marquee */}
      {ev.vibe.length > 0 && (
        <div className="ep-marquee" data-reveal>
          <div className="ep-marquee__track">
            {[...ev.vibe, ...ev.vibe].map((v, i) => (
              <Fragment key={i}><span>{v}</span><span className="d">✦</span></Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      {details.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <div className="ep-details">
              {details.map((d) => (
                <div key={d.label} className="ep-detail v6-glass" data-reveal>
                  <div className="ep-detail__icon"><d.Icon strokeWidth={1.6} aria-hidden /></div>
                  <div className="ep-detail__label">{d.label}</div>
                  {d.val && <div className="ep-detail__val">{d.val}</div>}
                  {d.sub && <div className="ep-detail__sub">{d.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {ev.timeline.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ep-section-title" data-reveal>מה הולך <span className="ep-neon">הערב?</span></h2>
            <div className="ep-timeline v6-glass" data-reveal style={{ padding: "8px 28px", borderRadius: "var(--r-lg)" }}>
              {ev.timeline.map((r) => (
                <div key={r.time + r.t} className="ep-tl__row">
                  <span className="ep-tl__time">{r.time}</span>
                  <span className="ep-tl__what"><b>{r.t}</b>{r.s && <span>{r.s}</span>}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lineup */}
      {ev.lineup.length > 0 && (
        <section className="v6-section" id="lineup">
          <div className="v6-container">
            <h2 className="ep-section-title" data-reveal>מי על <span className="ep-neon">הדקים</span></h2>
            <div className="ep-lineup">
              {ev.lineup.map((dj) => (
                <article key={dj.name} className="ep-dj v6-glass" data-reveal>
                  {dj.img && <div className="ep-dj__img"><img src={dj.img} alt={dj.name} /></div>}
                  <div className="ep-dj__body">
                    <div className="ep-dj__name">{dj.name}</div>
                    {dj.role && <div className="ep-dj__role">{dj.role}</div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {ev.partyGallery.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ep-section-title" data-reveal>ככה זה נראה <span className="ep-neon">אצלנו</span></h2>
            <div className="ep-gallery">
              {ev.partyGallery.map((g) => (
                <figure key={g} data-reveal><img src={g} alt="" /></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vibe quotes */}
      {ev.partyQuotes.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ep-section-title" data-reveal>מה אמרו <span className="ep-neon">בפעם שעברה</span></h2>
            <div className="ep-vibe">
              {ev.partyQuotes.map((v) => (
                <article key={v.q} className="ep-vibe__card v6-glass" data-reveal>
                  <div className="ep-vibe__q">״{v.q}״</div>
                  {v.by && <div className="ep-vibe__by">- {v.by}</div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {ev.partyFaq.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="ep-section-title" data-reveal>שאלות לפני שיוצאים</h2>
            <Faq items={ev.partyFaq} kind="ep" />
          </div>
        </section>
      )}

      {/* Register band */}
      <section className="v6-section" id="register">
        <div className="v6-container">
          <div className="ep-band v6-glass" data-reveal>
            <div className="ep-band__bg" />
            <h2>אל תישארו בבית</h2>
            <a href={ev.cta || "/#contact"} className="v6-btn v6-btn--lg ep-btn--party" data-magnetic=""><span>כן, אני בא/ה!</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
