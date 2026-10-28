"use client";

import SiteShell from "../v6/SiteShell";
import { getJob } from "../jobs/data";

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
  </svg>
);

// ponytail: the page still shows listing 1001 only; description/requirements/tags below are its copy.
// Upgrade path: /job/[id] reading getJob(id), with those three fields moved into jobs/data.ts.
const job = getJob(1001)!;

const DESCRIPTION = [
  "אנו מחפשים מנהל/ת פרויקטים מנוסה ומוכשר/ת להצטרף לצוות הדינמי שלנו. התפקיד כולל ניהול פרויקטים מורכבים בתחום הנדל״ן, החל משלב התכנון הראשוני, דרך הליווי והביצוע בשטח, ועד למסירה הסופית ללקוח. המועמד/ת תהיה אחראי/ת על עמידה בלוחות זמנים, ניהול תקציב, תיאום בין גורמים שונים (קבלנים, אדריכלים, מהנדסים), ובקרת איכות.",
  "התפקיד דורש יכולות ניהוליות גבוהות, ראייה מערכתית, יכולת פתרון בעיות ויחסי אנוש מצוינים. הזדמנות מצוינת להשתלב בחברה מובילה בתחומה ולהיות חלק מפרויקטים משמעותיים המשפיעים על נוף העיר.",
];

const REQUIREMENTS = [
  "ניסיון מוכח של 3 שנים לפחות בניהול פרויקטים בתחום הנדל״ן.",
  "השכלה רלוונטית (הנדסה אזרחית, אדריכלות, ניהול פרויקטים).",
  "יכולת עבודה עצמאית ובצוות.",
  "שליטה מלאה בתוכנות MS Project ו‑Office.",
  "רישיון נהיגה בתוקף.",
  "יכולת הגעה עצמאית לאתרי הפרויקטים.",
];

const TAGS = ["ניסיון", "תל אביב", "משרה מלאה", "ניהול פרויקטים", "נדל״ן"];

export default function JobPage() {
  return (
    <SiteShell>

      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-panel__head">
              <div className="pg-panel__title">
                <h1>{job.title}</h1>
                <div className="pg-panel__by">פורסם על ידי <a href="/profile"><b>{job.by}</b></a></div>
                <div className="pg-panel__id">מס׳ משרה {job.id}</div>
              </div>
              <div className="pg-panel__logo">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80" alt="" />
              </div>
            </div>

            <div className="pg-meta">
              <div className="pg-meta__row"><b>סוג עבודה:</b> {job.type}</div>
              <div className="pg-meta__row"><b>מיקום:</b> {job.place}</div>
              <div className="pg-meta__row"><b>תאריך פרסום:</b> {job.date}</div>
            </div>

            <div className="pg-block">
              <h2>תיאור המשרה</h2>
              {DESCRIPTION.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <div className="pg-block">
              <h2>דרישות עיקריות</h2>
              <ul className="pg-bullets">
                {REQUIREMENTS.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>

            <div className="pg-block">
              <h2>תגיות</h2>
              <div className="pg-tags">
                {TAGS.map((t) => <span key={t} className="pg-tag">{t}</span>)}
              </div>
            </div>

            <div className="pg-divider" />
            <div className="pg-actions">
              <a
                href={`mailto:${job.email}?subject=${encodeURIComponent(`פנייה למשרה מס׳ ${job.id}: ${job.title}`)}`}
                className="pg-iconbtn"
                aria-label={`שליחת הודעה ל${job.by}`}
                title={`שליחת הודעה ל${job.by}`}
              >
                <MailIcon />
              </a>
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic="">
                <span>שתף משרה</span>
                <ShareIcon />
              </a>
              <a href="/jobs" className="v6-btn v6-btn--glass">חזרה ללוח הדרושים</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
