"use client";

import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Job = { title: string; by: string; type: string; place: string; desc: string; date: string };

const JOBS: Job[] = [
  { title: "מנהל/ת פרויקטים בנדל״ן", by: "אבי כהן", type: "משרה מלאה", place: "תל אביב", desc: "ניהול פרויקטים מורכבים בתחום הנדל״ן, כולל תכנון, ביצוע ובקרת תקציב.", date: "15.11.2023" },
  { title: "יועץ/ת שיווק דיגיטלי", by: "שרה לוי", type: "פרילנס", place: "מרחוק", desc: "בניית אסטרטגיות שיווק דיגיטלי וניהול קמפיינים לחברות נדל״ן.", date: "14.11.2023" },
  { title: "שותף/ה למיזם סטארט-אפ נדל״ן", by: "דוד מזרחי", type: "שותפות עסקית", place: "תל אביב", desc: "מחפשים שותף טכנולוגי עם ניסיון בפיתוח פלטפורמות דיגיטליות.", date: "13.11.2023" },
  { title: "מתנדב/ת לפרויקט שיפוץ קהילתי", by: "רחל כהן", type: "התנדבות", place: "ירושלים", desc: "דרושים מתנדבים עם ידע בשיפוצים קלים לעזרה בפרויקט קהילתי.", date: "12.11.2023" },
  { title: "מתווך/ת נדל״ן למשרד בוטיק", by: "יוסי לוי", type: "משרה חלקית", place: "הרצליה", desc: "מתווך/ת עם רישיון וניסיון למשרד תיווך יוקרתי.", date: "11.11.2023" },
  { title: "שמאי/ת מקרקעין עצמאי/ת", by: "מיכל מזרחי", type: "מציעים שירותים", place: "כל הארץ", desc: "שמאית מקרקעין מוסמכת מציעה שירותי הערכת שווי לנכסים.", date: "10.11.2023" },
];

const FILTERS: { label: string; options: string[] }[] = [
  { label: "תאריך פרסום", options: ["הכל", "השבוע", "החודש"] },
  { label: "מיקום", options: ["כל המיקומים", "תל אביב", "ירושלים", "הרצליה", "מרחוק"] },
  { label: "תחום עיסוק", options: ["כל התחומים", "ניהול", "שיווק", "תיווך", "שמאות"] },
  { label: "סוג מודעה", options: ["כל הסוגים", "משרה מלאה", "פרילנס", "התנדבות", "שותפות"] },
];

export default function JobsPage() {
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
            <h1>לוח דרושים — <em>הזדמנויות בקהילה שלנו</em></h1>
            <p>החזון שלנו הוא לחבר בין אנשים בקהילה, לפתוח דלתות ולהציע את הזה לזה. כאן תוכלו למצוא הזדמנויות עבודה, להציע שירותים, למצוא שותפים עסקיים ואף להתנדב בפרויקטים קהילתיים — הכל מתוך אמון וקשר שכבר קיימים בקהילה.</p>
          </div>

          <div className="pg-toolbar" data-reveal>
            {FILTERS.map((f) => (
              <select key={f.label} className="pg-select" aria-label={f.label} defaultValue={f.options[0]}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          <div className="pg-grid">
            {JOBS.map((j) => (
              <article key={j.title} className="pg-card v6-glass" data-reveal>
                <h3 className="pg-card__title">{j.title}</h3>
                <div className="pg-card__by">מפרסם: <b>{j.by}</b></div>
                <div className="pg-card__rows">
                  <div><b>סוג עבודה:</b>{j.type}</div>
                  <div><b>מיקום:</b>{j.place}</div>
                </div>
                <p className="pg-card__desc">{j.desc}</p>
                <div className="pg-card__foot">
                  <span className="pg-card__date">פורסם: {j.date}</span>
                  <a href="/job" className="v6-btn v6-btn--primary" style={{ padding: "10px 18px", fontSize: 13.5 }}>
                    <span>פרטים נוספים</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/job" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>פרסם משרה פתוחה — חינם לחברי הקהילה</span>
              <ArrowIcon />
            </a>
            <a href="/#contact" className="v6-btn v6-btn--glass v6-btn--lg">הצטרף לקהילה וקבל גישה מלאה</a>
            <a href="/profile" className="v6-btn v6-btn--glass v6-btn--lg">הצג את השירותים שלך</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
