"use client";

import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Person = { img: number; name: string; role: string; quote: string };

const PEOPLE: Person[] = [
  { img: 12, name: "אבי כהן", role: "יזם נדל״ן ומנטור", quote: "״מאמין בכוחה של קהילה לשינוי וצמיחה אישית ומקצועית.״" },
  { img: 5, name: "שרה לוי", role: "מומחית לשיווק דיגיטלי בנדל״ן", quote: "״התשוקה שלי היא לחבר בין אנשים לנכסים, דרך חדשנות.״" },
  { img: 33, name: "דוד מזרחי", role: "יועץ השקעות נדל״ן", quote: "״אני כאן כדי לעזור לכם למצוא את ההשקעה הבאה שלכם.״" },
  { img: 24, name: "רחל כהן", role: "אדריכלית ומעצבת פנים", quote: "״יוצרת חללים שמשלבים פונקציונליות ויופי.״" },
  { img: 53, name: "יוסי לוי", role: "מתווך נדל״ן בכיר", quote: "״מוצא את הבית המושלם לכל לקוח, בכל פעם מחדש.״" },
  { img: 47, name: "מיכל מזרחי", role: "שמאית מקרקעין", quote: "״מספקת הערכות שווי מדויקות ואמינות לכל סוגי הנכסים.״" },
];

const FILTERS: { label: string; options: string[] }[] = [
  { label: "פילטר לפי מיקום", options: ["כל המיקומים", "תל אביב", "ירושלים", "הרצליה", "מרכז"] },
  { label: "פילטר לפי תחום עיסוק", options: ["כל התחומים", "יזמות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות"] },
];

export default function NadlanistimPage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הכר את הנדלניסטים שלנו — <em>סיפורים של אנשים אמיתיים</em></h1>
            <p>הקהילה שלנו בנויה מאנשים עם סיפורים ייחודיים, חלומות, והישגים. כל נדלניסט מביא איתו ניסיון, ערכים ורצון לתרום ולהיתרום. בואו להכיר את הפנים מאחורי הקהילה.</p>
          </div>

          <div className="pg-toolbar" data-reveal>
            <input className="pg-search" type="search" placeholder="חיפוש חופשי…" aria-label="חיפוש חופשי" />
            {FILTERS.map((f) => (
              <select key={f.label} className="pg-select" aria-label={f.label} defaultValue={f.options[0]}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          <div className="pg-grid">
            {PEOPLE.map((p) => (
              <article key={p.name} className="pg-person v6-glass" data-reveal>
                <div className="pg-person__av"><img src={`https://i.pravatar.cc/200?img=${p.img}`} alt={p.name} /></div>
                <div className="pg-person__name">{p.name}</div>
                <div className="pg-person__role">{p.role}</div>
                <p className="pg-person__q">{p.quote}</p>
                <a href="/profile" className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>קרא עוד</a>
              </article>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>שתף את הסיפור שלך — הגש מועמדות להצגה</span><ArrowIcon /></a>
            <a href="/#contact" className="v6-btn v6-btn--glass v6-btn--lg">רוצה להיות חלק מהסיפור? הצטרף לקהילה</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
