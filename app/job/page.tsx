"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
  </svg>
);

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
  const [sent, setSent] = useState(false);

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
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-panel__head">
              <div className="pg-panel__title">
                <h1>מנהל/ת פרויקטים בנדל״ן</h1>
                <div className="pg-panel__by">פורסם על ידי <a href="/profile"><b>אבי כהן</b></a></div>
              </div>
              <div className="pg-panel__logo">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80" alt="" />
              </div>
            </div>

            <div className="pg-meta">
              <div className="pg-meta__row"><b>סוג עבודה:</b> משרה מלאה</div>
              <div className="pg-meta__row"><b>מיקום:</b> תל אביב</div>
              <div className="pg-meta__row"><b>תאריך פרסום:</b> 15.11.2023</div>
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

            <div className="pg-block">
              <h2>פרטי התקשרות</h2>
              <div className="pg-contact-lines">
                <div><b>אימייל:</b> <a href="mailto:jobs@communityplatform.com">jobs@communityplatform.com</a></div>
                <div><b>טלפון:</b> 050-1234567</div>
              </div>
              <p className="pg-note">ניתן גם למלא את הטופס הבא:</p>

              {sent ? (
                <div className="pg-sent">הפנייה נשלחה. ✓ נחזור אליך בהקדם.</div>
              ) : (
                <form className="pg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                  <div className="v6-field">
                    <label htmlFor="j-name">שם מלא</label>
                    <input id="j-name" type="text" required placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-email">כתובת אימייל</label>
                    <input id="j-email" type="email" required placeholder="you@email.com" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-msg">הודעה / קורות חיים</label>
                    <textarea id="j-msg" required placeholder="כמה מילים עליך, ולמה התפקיד מתאים לך…" />
                  </div>
                  <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
                    <span>שלח פנייה</span>
                    <ArrowIcon />
                  </button>
                </form>
              )}
            </div>

            <div className="pg-divider" />
            <div className="pg-actions">
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
