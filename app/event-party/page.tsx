"use client";

import { Fragment } from "react";
import SiteShell from "../v6/SiteShell";
import "./event-party.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VIBE = ["מוזיקה", "בר פתוח", "נטוורקינג", "ריקודים", "הפתעות", "DJ סטים", "אפטר עד הסוף"];

const DETAILS = [
  { icon: "🗓️", label: "מתי", val: "יום ה׳, 3 ביולי 2026", sub: "21:00 עד מאוחר" },
  { icon: "📍", label: "איפה", val: "Rooftop TLV", sub: "גג בלב תל אביב" },
  { icon: "👗", label: "דרֶס קוד", val: "Smart casual / לבן", sub: "בואו מוכנים לרקוד" },
  { icon: "🎟️", label: "כניסה", val: "חינם לחברי קהילה / 80₪", sub: "כולל כוס ראשונה על הבית" },
];

const TIMELINE = [
  { time: "21:00", t: "פתיחת דלתות + בר", s: "מתחממים עם קוקטייל וזיהוי פנים מהקהילה." },
  { time: "22:00", t: "DJ סט פתיחה", s: "הביטים מתחילים, הרחבה מתמלאת." },
  { time: "23:00", t: "סט ראשי + הפתעה", s: "הרגע שכולם מחכים לו." },
  { time: "00:30", t: "אפטר", s: "ממשיכים עד שמכבים את האורות." },
];

const LINEUP = [
  { img: 15, name: "DJ נועם", role: "House / Groove" },
  { img: 33, name: "DJ שירה", role: "Hits & Throwbacks" },
  { img: 52, name: "Live: רן מימון", role: "סט סקסופון חי" },
];

const GALLERY = ["1470225620780-dba8ba36b745", "1516450360452-9312f5e86fc7", "1429962714451-bb934ecdc4ec", "1514525253161-7a46d19cd819", "1459749411175-04bf5292ceea", "1492684223066-81342ee5ff30"];

const VIBES = [
  { q: "״הכי כיף שהיה. רקדנו עד 3, וגם סגרתי עסקה.״", by: "נועה ברגר" },
  { q: "״סוף סוף אירוע נדל״ן שבא בלי עניבה.״", by: "אלון שמיר" },
  { q: "״האנשים, המוזיקה, הוייב — מושלם.״", by: "שירה אלוני" },
];

const FAQ = [
  "מה גיל הכניסה?",
  "יש חניה בקרבת מקום?",
  "אפשר להביא מלווה שאינו חבר קהילה?",
  "מה קורה אם יורד גשם? (יש אזור מקורה)",
];

export default function EventPartyPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ep-herowrap" data-reveal>
            <div className="ep-herowrap__bg">
              <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2000&q=80" alt="" />
            </div>
            <div className="ep-hero">
              <span className="ep-badge">🎉 מסיבת הקיץ 2026</span>
              <h1 className="ep-neon">מסיבת<br />הנדלניסטים</h1>
              <p>לילה אחד. הבר פתוח, המוזיקה חזקה, וכל מי שמזיז את הנדל״ן בישראל — על רחבת ריקודים אחת.</p>
              <div className="ep-hero__cta">
                <a href="#register" className="v6-btn v6-btn--lg ep-btn--party" data-magnetic=""><span>שריינו מקום</span><ArrowIcon /></a>
                <a href="#lineup" className="v6-btn v6-btn--glass v6-btn--lg">מי על הדקים?</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vibe marquee */}
      <div className="ep-marquee" data-reveal>
        <div className="ep-marquee__track">
          {[...VIBE, ...VIBE].map((v, i) => (
            <Fragment key={i}><span>{v}</span><span className="d">✦</span></Fragment>
          ))}
        </div>
      </div>

      {/* Details */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ep-details">
            {DETAILS.map((d) => (
              <div key={d.label} className="ep-detail v6-glass" data-reveal>
                <div className="ep-detail__icon">{d.icon}</div>
                <div className="ep-detail__label">{d.label}</div>
                <div className="ep-detail__val">{d.val}</div>
                <div className="ep-detail__sub">{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ep-section-title" data-reveal>מה הולך <span className="ep-neon">הערב?</span></h2>
          <div className="ep-timeline v6-glass" data-reveal style={{ padding: "8px 28px", borderRadius: "var(--r-lg)" }}>
            {TIMELINE.map((r) => (
              <div key={r.time} className="ep-tl__row">
                <span className="ep-tl__time">{r.time}</span>
                <span className="ep-tl__what"><b>{r.t}</b><span>{r.s}</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section className="v6-section" id="lineup">
        <div className="v6-container">
          <h2 className="ep-section-title" data-reveal>מי על <span className="ep-neon">הדקים</span></h2>
          <div className="ep-lineup">
            {LINEUP.map((dj) => (
              <article key={dj.name} className="ep-dj v6-glass" data-reveal>
                <div className="ep-dj__img"><img src={`https://i.pravatar.cc/400?img=${dj.img}`} alt={dj.name} /></div>
                <div className="ep-dj__body">
                  <div className="ep-dj__name">{dj.name}</div>
                  <div className="ep-dj__role">{dj.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ep-section-title" data-reveal>ככה זה נראה <span className="ep-neon">אצלנו</span></h2>
          <div className="ep-gallery">
            {GALLERY.map((g) => (
              <figure key={g} data-reveal><img src={`https://images.unsplash.com/photo-${g}?w=700&q=80`} alt="" /></figure>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe quotes */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ep-section-title" data-reveal>מה אמרו <span className="ep-neon">בפעם שעברה</span></h2>
          <div className="ep-vibe">
            {VIBES.map((v) => (
              <article key={v.by} className="ep-vibe__card v6-glass" data-reveal>
                <div className="ep-vibe__q">{v.q}</div>
                <div className="ep-vibe__by">— {v.by}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ep-section-title" data-reveal>שאלות לפני שיוצאים</h2>
          <div className="ep-faq">
            {FAQ.map((q) => (
              <div key={q} className="ep-faq__item v6-glass" data-reveal><span className="ep-faq__q">?</span>{q}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Register band */}
      <section className="v6-section" id="register">
        <div className="v6-container">
          <div className="ep-band v6-glass" data-reveal>
            <div className="ep-band__bg" />
            <h2>אל תישארו בבית 🪩</h2>
            <p>מקומות מוגבלים · הכניסה לפי רשימה מראש.</p>
            <a href="/#contact" className="v6-btn v6-btn--lg ep-btn--party" data-magnetic=""><span>כן, אני בא/ה!</span><ArrowIcon /></a>
            <div className="ep-band__note">💡 חברי הקהילה נכנסים חינם ומקבלים כוס ראשונה על הבית.</div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
