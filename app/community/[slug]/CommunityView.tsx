"use client";

import { useRef } from "react";
import { CalendarDays, GraduationCap, Handshake, MessageCircle } from "lucide-react";
import SiteShell from "../../v6/SiteShell";
import "../../communities/communities.css";
import type { Community } from "../../communities/data";
import type { Nadlanist } from "../../nadlanistim/data";
import OpenToWorkRing from "../../v6/OpenToWorkRing";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function MembersCarousel({ people }: { people: Nadlanist[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };
  return (
    <div className="cs-mem-carousel" data-reveal>
      <button className="cs-mem-arrow cs-mem-arrow--prev" aria-label="הקודם" onClick={() => scroll(1)}><ChevIcon /></button>
      <div className="cs-mem-track" ref={ref}>
        {people.map((n) => (
          <a key={n.slug} href={`/nadlanist/${n.slug}`} className="cs-mem v6-glass">
            <div className="cs-mem__av"><img src={n.photo} alt={n.name} />{n.openToWork && <OpenToWorkRing />}</div>
            <div className="cs-mem__name">{n.name}</div>
            <div className="cs-mem__role">{n.role}</div>
            <p className="cs-mem__quote">״{n.quote}״</p>
            <div className="cs-mem__foot">{n.field} · {n.place}</div>
          </a>
        ))}
      </div>
      <button className="cs-mem-arrow cs-mem-arrow--next" aria-label="הבא" onClick={() => scroll(-1)}><ChevIcon /></button>
    </div>
  );
}

// White line icons for "מה קורה בקהילה" (no colour emoji)
const HAPPENING_ICONS = { calendar: CalendarDays, chat: MessageCircle, expert: GraduationCap, deal: Handshake };

export default function CommunityView({ c, others, people }: { c?: Community; others: Community[]; people: Nadlanist[] }) {

  if (!c) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>הקהילה <em>לא נמצאה</em></h1>
              <p>ייתכן שהקישור שגוי.</p>
            </div>
            <div className="pg-cta-row">
              <a href="/communities" className="v6-btn v6-btn--primary v6-btn--lg"><span>לכל הקהילות</span><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell crumb={c.name}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <a href="/communities" className="cs-back" data-reveal>→ כל הקהילות</a>

          <div className="cs-hero" data-reveal>
            <div className="cs-hero__bg">{c.cover && <img src={c.cover} alt="" />}</div>
            <div className="cs-hero__in">
              <span className="cs-hero__badge">● קהילה{c.members && ` · ${c.members} חברים`}</span>
              <h1>{c.name}</h1>
              <p>{c.tagline}</p>
              <a href="#join" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הצטרפו לקהילה</span><ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {c.about.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <div className="cs-about" data-reveal>
              <h2 className="cs-title">על הקהילה</h2>
              {c.about.map((p, i) => <p key={i} className="cs-lead">{p}</p>)}
            </div>
          </div>
        </section>
      )}

      {/* What happens here */}
      {c.happenings.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="cs-title cs-title--center" data-reveal>מה קורה בקהילה</h2>
            <div className="cs-happenings">
              {c.happenings.map((h) => {
                const Icon = HAPPENING_ICONS[h.ic];
                return (
                  <div key={h.t} className="cs-hap v6-glass" data-reveal>
                    <span className="cs-hap__ic"><Icon strokeWidth={1.6} aria-hidden /></span>
                    <div>
                      <b>{h.t}</b>
                      <p>{h.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {c.gallery.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="cs-title cs-title--center" data-reveal>מהשטח</h2>
            <div className="cs-gallery">
              {c.gallery.map((g, i) => (
                <figure key={g + i} className="cs-shot" data-reveal>
                  <img src={g} alt="" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Members from the nadlanistim index */}
      {people.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="cs-title cs-title--center" data-reveal>חלק מהחברים בקהילה</h2>
            <MembersCarousel people={people} />
          </div>
        </section>
      )}

      {/* Join CTA */}
      <section className="v6-section" id="join">
        <div className="v6-container">
          <div className="cs-join v6-glass" data-reveal>
            <h2>רוצים להיות חלק מקהילת <em>{c.name}</em>?</h2>
            <p>הצטרפו ל{c.members ? `‑${c.members} ` : ""}חברים שכבר מדברים, לומדים וסוגרים עסקאות יחד. חינם לחברי הנדלניסטים.</p>
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              {/* The community's WhatsApp group when WordPress has its link; the site's join form otherwise. */}
              <a
                href={c.whatsapp ?? "/#contact"}
                {...(c.whatsapp && { target: "_blank", rel: "noopener noreferrer" })}
                className="v6-btn v6-btn--primary v6-btn--lg"
                data-magnetic=""
              ><span>הצטרפו לקהילה</span><ArrowIcon /></a>
              <a href="/communities" className="v6-btn v6-btn--glass v6-btn--lg">לכל הקהילות</a>
            </div>
          </div>
        </div>
      </section>

      {/* Other communities */}
      {others.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="cs-title cs-title--center" data-reveal>עוד קהילות</h2>
            <div className="cm-grid">
              {others.map((o) => (
                <a key={o.slug} href={`/community/${o.slug}`} className="cm-card v6-glass" data-reveal>
                  {o.logo && <div className="cm-card__logo"><img src={o.logo} alt="" /></div>}
                  <h3>{o.name}</h3>
                  <p>{o.tagline}</p>
                  {o.members && <div className="cm-card__members">{o.members} חברים</div>}
                  <span className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>לקהילה</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
