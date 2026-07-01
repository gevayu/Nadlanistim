"use client";

import SiteShell from "../v6/SiteShell";
import "./youth.css";
import { MEMBERS } from "./data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PERKS = [
  { ic: "🚀", t: "מנטורינג אישי", d: "ליווי מהנדלניסטים הבכירים בקהילה." },
  { ic: "🤝", t: "גישה מועדפת לעסקאות", d: "הזדמנויות ושותפויות לפני כולם." },
  { ic: "🎓", t: "מסלול צמיחה", d: "סדנאות, מאסטרקלאסים וכלים מעשיים." },
  { ic: "🎤", t: "במה", d: "חשיפה, הרצאות ופרויקטים משותפים." },
];

export default function YouthPage() {
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
              <p>25 נדלניסטים ונדלניסטיות מתחת לגיל 25 שעוד יכבשו את עולם הנדל״ן של ישראל!</p>
              <a href="/nadlanist-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הגישו מועמדות</span><ArrowIcon /></a>
              <div className="yt-stats">
                <div className="yt-stat"><b>25</b><span>חברי נבחרת</span></div>
                <div className="yt-stat"><b>25</b><span>גיל מקסימלי</span></div>
                <div className="yt-stat"><b>12</b><span>תחומים</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>מה זה בעצם?</h2>
          <p className="yt-lead" data-reveal>נבחרת הנדלניסטים הצעירים היא תוכנית ייחודית שמזהה, מלווה ומקדמת את הכישרונות הצעירים של ענף הנדל״ן הישראלי. הנבחרת מקבלת מנטורינג, גישה מועדפת להזדמנויות, ובמה להצמיח את הקריירה — כי הדור הבא של הנדל״ן נבנה כאן, עכשיו.</p>
        </div>
      </section>

      {/* Members */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>חברי הנבחרת</h2>
          <div className="yt-members">
            {MEMBERS.map((m) => (
              <a key={m.slug} href={`/youth/${m.slug}`} className="yt-member v6-glass" data-reveal>
                <div className="yt-member__av"><img src={`https://i.pravatar.cc/320?img=${m.img}`} alt={m.name} /></div>
                <div className="yt-member__info">
                  <div className="yt-member__name">{m.name}</div>
                  <div className="yt-member__role">{m.role} · {m.place}</div>
                  <p className="yt-member__line">{m.oneLiner}</p>
                  <span className="yt-member__more">לפרופיל המלא <ArrowIcon /></span>
                </div>
              </a>
            ))}
          </div>
          <div className="pg-cta-row" data-reveal>
            <a href="/nadlanistim" className="v6-btn v6-btn--glass v6-btn--lg">לכל הנדלניסטים</a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>מה מקבלים?</h2>
          <div className="yt-perks">
            {PERKS.map((p) => (
              <div key={p.t} className="yt-perk" data-reveal>
                <span className="yt-perk__ic">{p.ic}</span>
                <div><b>{p.t}</b><p>{p.d}</p></div>
              </div>
            ))}
          </div>
          <div className="pg-cta-row" data-reveal>
            <a href="/nadlanist-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>רוצים להצטרף לנבחרת? הגישו מועמדות</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
