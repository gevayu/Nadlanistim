"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import "./youth.css";
import { roleLine, type TeamMember } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Filter row: every field a member has, so a filter can never come up empty.
const filtersFor = (members: TeamMember[]) => ["הכל", ...new Set(members.map((m) => m.field).filter(Boolean))];

export default function YouthTeam({ members }: { members: TeamMember[] }) {
  const [active, setActive] = useState("הכל");
  const shown = active === "הכל" ? members : members.filter((m) => m.field === active);
  const filters = filtersFor(members);

  return (
    <SiteShell>
      {/* Hero banner */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="yt-hero" data-reveal>
            <div className="yt-hero__bg"><img src="/group-people-new-year-s-party.jpg" alt="" /></div>
            <div className="yt-hero__in">
              <span className="yt-badge">● פרויקט מיוחד</span>
              <h1>נבחרת הנדלניסטים <em>הצעירים</em></h1>
              <p>{members.length} נדלניסטים ונדלניסטיות מתחת לגיל 25 שעוד יכבשו את עולם הנדל״ן של ישראל!</p>
              <a href="/nadlanist-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הגישו מועמדות</span><ArrowIcon /></a>
              <div className="yt-stats">
                <div className="yt-stat"><b>{members.length}</b><span>חברי נבחרת</span></div>
                <div className="yt-stat"><b>25</b><span>גיל מקסימלי</span></div>
                <div className="yt-stat"><b>{filters.length - 1}</b><span>תחומים</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>מה זה בעצם?</h2>
          <p className="yt-lead" data-reveal>נבחרת הנדלניסטים הצעירים היא תוכנית ייחודית שמזהה, מלווה ומקדמת את הכישרונות הצעירים של ענף הנדל״ן הישראלי. הנבחרת מקבלת מנטורינג, גישה מועדפת להזדמנויות, ובמה להצמיח את הקריירה - כי הדור הבא של הנדל״ן נבנה כאן, עכשיו.</p>
        </div>
      </section>

      {/* Members */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>חברי הנבחרת</h2>
          <div className="yt-filters" data-reveal>
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                className={`yt-filter${active === f ? " is-active" : ""}`}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="yt-members">
            {shown.map((m) => (
              <a key={m.slug} href={`/youth/${m.slug}`} className="yt-member v6-glass">
                {m.photo && <div className="yt-member__av"><img src={m.photo} alt={m.name} /></div>}
                <div className="yt-member__info">
                  <div className="yt-member__name">{m.name}</div>
                  {roleLine(m) && <div className="yt-member__role">{roleLine(m)}</div>}
                  {m.oneLiner && <p className="yt-member__line">{m.oneLiner}</p>}
                  <span className="yt-member__more">לפרופיל המלא <ArrowIcon /></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-cta-row" data-reveal>
            <a href="/nadlanist-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>רוצים להצטרף לנבחרת? הגישו מועמדות</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
