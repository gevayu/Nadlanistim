"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import "../collaborations/collaborations.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M12 15V3m0 0l4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SELECTS: { id: string; label: string; options: string[] }[] = [
  { id: "type", label: "סוג שיתוף הפעולה", options: ["בחרו…", "קרקע", "בנייה", "שיפוצים", "השקעות", "טכנולוגיה"] },
  { id: "role", label: "תפקיד נדרש", options: ["בחרו…", "שותף פיננסי", "שותף מקצועי", "קבלן", "יועץ"] },
  { id: "area", label: "אזור", options: ["בחרו…", "צפון", "מרכז", "דרום", "ירושלים", "כל הארץ"] },
  { id: "invest", label: "רמת השקעה", options: ["בחרו…", "עד 100K", "עד 500K", "מיליון+", "ללא השקעה כספית"] },
  { id: "stage", label: "שלב הפרויקט", options: ["בחרו…", "רעיון", "תכנון", "ביצוע", "מתקדם"] },
];

export default function CollaborationNewPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>פרסום <em>שיתוף פעולה</em></h1>
            <p>יש לכם רעיון, פרויקט או הזדמנות? שתפו את הקהילה ומצאו את השותף הנכון. חינם לחברי הקהילה.</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            {sent ? (
              <div className="pg-sent">שיתוף הפעולה נשלח לאישור. ✓ הוא יעלה ללוח תוך 24 שעות.</div>
            ) : (
              <form className="pg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="v6-field">
                  <label htmlFor="n-title">כותרת הפרויקט / הרעיון</label>
                  <input id="n-title" type="text" required placeholder="לדוגמה: פינוי־בינוי, גבעת שמואל" />
                </div>

                <div className="co-formgrid">
                  {SELECTS.map((s) => (
                    <div className="v6-field" key={s.id}>
                      <label htmlFor={`n-${s.id}`}>{s.label}</label>
                      <select id={`n-${s.id}`} required defaultValue="">
                        <option value="" disabled>{s.options[0]}</option>
                        {s.options.slice(1).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="v6-field">
                  <label htmlFor="n-desc">תיאור מפורט</label>
                  <textarea id="n-desc" required placeholder="ספרו על הפרויקט, מה כבר קיים, ומה אתם מחפשים מהשותף/ה…" />
                </div>

                <div className="v6-field co-full">
                  <label>תמונת הפרויקט (אופציונלי)</label>
                  <label className="co-upload" htmlFor="n-img"><UploadIcon /> גררו תמונה לכאן או לחצו להעלאה</label>
                  <input id="n-img" type="file" accept="image/*" hidden />
                </div>

                <div className="pg-divider" style={{ margin: "8px 0" }} />
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>פרטי יצירת קשר</h2>
                <div className="co-formgrid">
                  <div className="v6-field">
                    <label htmlFor="n-name">שם מלא</label>
                    <input id="n-name" type="text" required placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="n-phone">טלפון</label>
                    <input id="n-phone" type="tel" required placeholder="050-0000000" />
                  </div>
                  <div className="v6-field co-full">
                    <label htmlFor="n-email">אימייל</label>
                    <input id="n-email" type="email" required placeholder="you@email.com" />
                  </div>
                </div>

                <label className="v6-contact__consent" htmlFor="n-consent">
                  <input id="n-consent" type="checkbox" required />
                  <span>מוסכמים עלי מדיניות הפרטיות ותנאי הפרסום של הקהילה.</span>
                </label>

                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" data-magnetic="">
                  <span>פרסם שיתוף פעולה</span>
                  <ArrowIcon />
                </button>
              </form>
            )}
          </article>

          <div className="pg-cta-row" data-reveal>
            <a href="/collaborations" className="v6-btn v6-btn--glass v6-btn--lg">חזרה ללוח שיתופי הפעולה</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
