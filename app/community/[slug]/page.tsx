"use client";

import { useParams } from "next/navigation";
import { useRef } from "react";
import SiteShell from "../../v6/SiteShell";
import "../../communities/communities.css";
import { getCommunity, COMMUNITIES } from "../../communities/data";
import { NADLANISTIM } from "../../nadlanistim/data";

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

function MembersCarousel() {
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
        {NADLANISTIM.map((n) => (
          <a key={n.slug} href={`/nadlanist/${n.slug}`} className="cs-mem v6-glass">
            <div className="cs-mem__av"><img src={`https://i.pravatar.cc/240?img=${n.img}`} alt={n.name} /></div>
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

const IMG = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export default function CommunitySinglePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const c = slug ? getCommunity(slug) : undefined;

  if (!c) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>תת הקהילה <em>לא נמצאה</em></h1>
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

  const others = COMMUNITIES.filter((x) => x.slug !== c.slug).slice(0, 3);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <a href="/communities" className="cs-back" data-reveal>→ כל הקהילות</a>

          <div className="cs-hero" data-reveal>
            <div className="cs-hero__bg"><img src={IMG(c.cover, 1400)} alt="" /></div>
            <div className="cs-hero__in">
              <span className="cs-hero__badge">● תת‑קהילה · {c.members} חברים</span>
              <h1>{c.name}</h1>
              <p>{c.tagline}</p>
              <a href="#join" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הצטרפו לתת הקהילה</span><ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="cs-about" data-reveal>
            <h2 className="cs-title">על הקהילה</h2>
            {c.about.map((p, i) => <p key={i} className="cs-lead">{p}</p>)}
          </div>
        </div>
      </section>

      {/* What happens here */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="cs-title cs-title--center" data-reveal>מה קורה בקהילה</h2>
          <div className="cs-happenings">
            {c.happenings.map((h) => (
              <div key={h.t} className="cs-hap v6-glass" data-reveal>
                <span className="cs-hap__ic">{h.ic}</span>
                <div>
                  <b>{h.t}</b>
                  <p>{h.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="cs-title cs-title--center" data-reveal>מהשטח</h2>
          <div className="cs-gallery">
            {c.gallery.map((g, i) => (
              <figure key={g + i} className="cs-shot" data-reveal>
                <img src={IMG(g, 800)} alt="" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Members from the nadlanistim index */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="cs-title cs-title--center" data-reveal>חלק מהחברים בקהילה</h2>
          <MembersCarousel />
        </div>
      </section>

      {/* Join CTA */}
      <section className="v6-section" id="join">
        <div className="v6-container">
          <div className="cs-join v6-glass" data-reveal>
            <h2>רוצים להיות חלק מקהילת <em>{c.name}</em>?</h2>
            <p>הצטרפו ל‑{c.members} החברים שכבר מדברים, לומדים וסוגרים עסקאות יחד. חינם לחברי הנדלניסטים.</p>
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הצטרפו לתת הקהילה</span><ArrowIcon /></a>
              <a href="/communities" className="v6-btn v6-btn--glass v6-btn--lg">לכל הקהילות</a>
            </div>
          </div>
        </div>
      </section>

      {/* Other communities */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="cs-title cs-title--center" data-reveal>עוד קהילות</h2>
          <div className="cm-grid">
            {others.map((o) => (
              <a key={o.slug} href={`/community/${o.slug}`} className="cm-card v6-glass" data-reveal>
                <div className="cm-card__logo"><img src="/community-badge.png" alt="" /></div>
                <h3>{o.name}</h3>
                <p>{o.tagline}</p>
                <div className="cm-card__members">{o.members} חברים</div>
                <span className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>לתת הקהילה</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
