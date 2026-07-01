"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SELECTS: { id: string; label: string; options: string[] }[] = [
  { id: "type", label: "סוג עבודה", options: ["בחרו…", "משרה מלאה", "משרה חלקית", "פרילנס", "התנדבות", "שותפות"] },
  { id: "area", label: "מיקום", options: ["בחרו…", "תל אביב", "מרכז", "צפון", "דרום", "ירושלים", "מרחוק"] },
  { id: "field", label: "תחום עיסוק", options: ["בחרו…", "ניהול", "שיווק", "תיווך", "שמאות", "הנדסה", "מימון", "טכנולוגיה"] },
];

export default function JobNewPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>פרסום <em>משרה חדשה</em></h1>
            <p>מחפשים עובד/ת, שותף/ה או נותן שירות? פרסמו את המשרה ותנו לקהילה למצוא לכם את האדם הנכון. חינם לחברי הקהילה.</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            {sent ? (
              <div className="pg-sent">המשרה נשלחה לאישור. ✓ היא תעלה ללוח הדרושים תוך 24 שעות.</div>
            ) : (
              <form className="pg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="v6-field">
                  <label htmlFor="j-title">כותרת המשרה</label>
                  <input id="j-title" type="text" required placeholder="לדוגמה: מנהל/ת פרויקטים בנדל״ן" />
                </div>

                <div className="pg-formgrid">
                  {SELECTS.map((s) => (
                    <div className="v6-field" key={s.id}>
                      <label htmlFor={`j-${s.id}`}>{s.label}</label>
                      <select id={`j-${s.id}`} required defaultValue="">
                        <option value="" disabled>{s.options[0]}</option>
                        {s.options.slice(1).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="v6-field">
                  <label htmlFor="j-desc">תיאור המשרה</label>
                  <textarea id="j-desc" required placeholder="פרטו על התפקיד, האחריות ומה מחפשים…" />
                </div>
                <div className="v6-field">
                  <label htmlFor="j-req">דרישות עיקריות</label>
                  <textarea id="j-req" placeholder="דרישה אחת בכל שורה…" />
                </div>
                <div className="v6-field">
                  <label htmlFor="j-tags">תגיות (מופרדות בפסיק)</label>
                  <input id="j-tags" type="text" placeholder="ניסיון, תל אביב, משרה מלאה" />
                </div>

                <div className="pg-divider" style={{ margin: "8px 0" }} />
                <h2>פרטי מפרסם</h2>
                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="j-name">שם / חברה</label>
                    <input id="j-name" type="text" required placeholder="שם מלא או שם החברה" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-phone">טלפון</label>
                    <input id="j-phone" type="tel" required placeholder="050-0000000" />
                  </div>
                  <div className="v6-field pg-full">
                    <label htmlFor="j-email">אימייל ליצירת קשר</label>
                    <input id="j-email" type="email" required placeholder="jobs@company.com" />
                  </div>
                </div>

                <label className="v6-contact__consent" htmlFor="j-consent">
                  <input id="j-consent" type="checkbox" required />
                  <span>מוסכמים עלי מדיניות הפרטיות ותנאי הפרסום של הקהילה.</span>
                </label>

                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" data-magnetic="">
                  <span>פרסם משרה</span>
                  <ArrowIcon />
                </button>
              </form>
            )}
          </article>

          <div className="pg-cta-row" data-reveal>
            <a href="/jobs" className="v6-btn v6-btn--glass v6-btn--lg">חזרה ללוח הדרושים</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
