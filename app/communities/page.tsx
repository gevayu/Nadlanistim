"use client";

import SiteShell from "../v6/SiteShell";
import "./communities.css";
import { COMMUNITY_LIST } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CommunitiesPage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הקהילות של <em>הנדלניסטים</em></h1>
            <p>קהילה אחת גדולה — ובתוכה עשר תתי‑קהילות ממוקדות. בחרו את התחומים שלכם, הצטרפו לשיחות הרלוונטיות אליכם, ותמצאו את האנשים שמדברים בדיוק בשפה שלכם.</p>
          </div>

          <div className="cm-grid">
            {COMMUNITY_LIST.map((c) => (
              <a key={c.slug} href={`/community/${c.slug}`} className="cm-card v6-glass" data-reveal>
                <div className="cm-card__logo"><img src="/community-badge.png" alt="" /></div>
                <h3>{c.name}</h3>
                <p>{c.tagline}</p>
                <div className="cm-card__members">{c.members} חברים</div>
                <span className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>לתת הקהילה</span>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>לא מצאתם תת‑קהילה? הציעו אחת חדשה</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
