"use client";

import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Ev = { img: string; title: string; date: string; desc: string };

const PAST: Ev[] = [
  { img: "1540575467063-178a50c2df87", title: "כנס הנדלניסטים 2025", date: "15 במאי 2025 · אקספו ת״א", desc: "יום שלם של פאנלים, עסקאות ונטוורקינג עם מיטב אנשי הענף." },
  { img: "1505373877841-8d25f7d46678", title: "מאסטרקלאס מיסוי מקרקעין", date: "20 במרץ 2025 · WeWork ת״א", desc: "שלוש שעות עומק על מס שבח, מס רכישה והפטורים החדשים." },
  { img: "1511795409834-ef04bbd61622", title: "ערב גאלה — 5 שנים לקהילה", date: "10 בדצמבר 2024 · האנגר 11", desc: "חגגנו חמש שנים יחד עם כל מי שבנה את הקהילה." },
];

const VOLUNTEER: Ev[] = [
  { img: "1556761175-5973dc0f32e7", title: "שיפוץ מרכז קהילתי", date: "2 בפברואר 2025 · יפו", desc: "מתנדבי הקהילה שיפצו מרכז נוער בשכונה." },
  { img: "1559223607-a43c990c692c", title: "ייעוץ נדל״ן לזוגות צעירים", date: "12 בינואר 2025 · אונליין", desc: "ערב ייעוץ חינמי עם מיטב היועצים בקהילה." },
  { img: "1582407947304-fd86f028f716", title: "סדנת אוריינות פיננסית", date: "5 בנובמבר 2024 · ת״א", desc: "סדנה פתוחה לקהל הרחב בנושא השקעות נדל״ן." },
];

const FILTERS: { label: string; options: string[] }[] = [
  { label: "פילטר לפי שנה", options: ["כל השנים", "2026", "2025", "2024"] },
  { label: "פילטר לפי סוג אירוע", options: ["כל הסוגים", "כנס", "מאסטרקלאס", "התנדבות", "גאלה"] },
  { label: "פילטר לפי מיקום", options: ["כל המיקומים", "תל אביב", "ירושלים", "אונליין"] },
];

function EvCard({ e }: { e: Ev }) {
  return (
    <article className="pg-imgcard v6-glass" data-reveal>
      <figure className="pg-imgcard__img"><img src={`https://images.unsplash.com/photo-${e.img}?w=800&q=80`} alt="" /></figure>
      <div className="pg-imgcard__body">
        <div className="pg-imgcard__meta">{e.date}</div>
        <h3>{e.title}</h3>
        <p className="pg-imgcard__desc">{e.desc}</p>
        <a href="/event-recap" className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>צפו במדיה</a>
      </div>
    </article>
  );
}

export default function EventsPage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#1</span>
          </div>
        </div>
      </section>

      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>נדלניסטים — <em>בשביל האירועים</em></h1>
            <p>כל האירועים שלנו במקום אחד — הקרובים, הקודמים ואירועי ההתנדבות של הקהילה.</p>
          </div>

          <div className="pg-toolbar" data-reveal>
            {FILTERS.map((f) => (
              <select key={f.label} className="pg-select" aria-label={f.label} defaultValue={f.options[0]}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
            <button type="button" className="v6-btn v6-btn--glass" style={{ padding: "11px 22px", fontSize: 13.5 }}>הצג</button>
          </div>

          {/* Featured upcoming */}
          <h2 className="pg-subhead" data-reveal>האירוע הקרוב</h2>
          <div className="pg-featured v6-glass" data-reveal>
            <div className="pg-featured__img"><img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80" alt="" /></div>
            <div className="pg-featured__body">
              <div className="pg-featured__date">14 ביוני 2026 · אקספו תל אביב</div>
              <h3>כנס הנדלניסטים השנתי 2026</h3>
              <p>היום הגדול של הקהילה. 42 מרצים, 3 פאנלים, 800 משתתפים.</p>
              <a href="/event" className="v6-btn v6-btn--primary" data-magnetic="" style={{ alignSelf: "flex-start" }}><span>לפרטים והרשמה</span><ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Past events */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="pg-subhead" data-reveal>אירועים קודמים</h2>
          <div className="pg-grid">
            {PAST.map((e) => <EvCard key={e.title} e={e} />)}
          </div>
        </div>
      </section>

      {/* Volunteer events */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="pg-subhead" data-reveal>אירועי התנדבות</h2>
          <div className="pg-grid">
            {VOLUNTEER.map((e) => <EvCard key={e.title} e={e} />)}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>רוצים להיות באירוע הבא? הצטרפו לקהילה</span><ArrowIcon /></a>
            <a href="/event-recap" className="v6-btn v6-btn--glass v6-btn--lg">לרשימת האירועים הקודמים</a>
          </div>
        </div>
      </section>

      <section className="v6-section">
        <div className="v6-container">
          <div className="v6-sponsorstrip v6-glass" data-reveal>
            <span className="v6-sponsorstrip__title">Sponsorship#2</span>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
