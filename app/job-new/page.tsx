"use client";

import { useEffect, useState } from "react";
import SiteShell from "../v6/SiteShell";
import { JOB_KINDS, type JobKind } from "../jobs/data";
import { sendJob } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SELECTS: { id: string; label: string; options: string[] }[] = [
  { id: "type", label: "סוג עבודה", options: ["בחרו…", "משרה מלאה", "משרה חלקית", "פרילנס", "התנדבות", "שותפות", "מציעים שירותים"] },
  { id: "area", label: "מיקום", options: ["בחרו…", "תל אביב", "מרכז", "צפון", "דרום", "ירושלים", "מרחוק"] },
  { id: "field", label: "תחום עיסוק", options: ["בחרו…", "ניהול", "שיווק", "תיווך", "שמאות", "הנדסה", "מימון", "טכנולוגיה"] },
];

export default function JobNewPage() {
  const { state, pending, onSubmit } = useFormSend(sendJob);
  const sent = !!state.ok;
  const [kind, setKind] = useState<JobKind>("offer");
  const seek = kind === "seek";

  // /job-new?kind=seek opens the form on "looking for work"
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("kind") === "seek") setKind("seek");
  }, []);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>פרסום <em>בלוח הדרושים</em></h1>
            <p>מחפשים עובד/ת, שותף/ה או נותן שירות? פרסמו את המשרה ותנו לקהילה למצוא לכם את האדם הנכון. חינם לחברי הקהילה. מחפשים עבודה? פרסמו מודעה וספרו לקהילה מה אתם מחפשים.</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            {sent ? (
              <div className="pg-sent">{seek ? "המודעה" : "המשרה"} נשלחה לאישור. ✓ היא תעלה ללוח הדרושים תוך 24 שעות.</div>
            ) : (
              <form className="pg-form" onSubmit={onSubmit}>
                <Honeypot />
                <fieldset className="pg-kind">
                  <legend>מה תרצו לפרסם?</legend>
                  {(Object.keys(JOB_KINDS) as JobKind[]).map((k) => (
                    <label key={k} className="pg-kind__opt">
                      <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
                      <span>{JOB_KINDS[k]}</span>
                    </label>
                  ))}
                </fieldset>

                <div className="v6-field">
                  <label htmlFor="j-title">{seek ? "כותרת המודעה" : "כותרת המשרה"}</label>
                  <input id="j-title" name="title" type="text" required placeholder={seek ? "לדוגמה: מנהלת שיווק מחפשת משרה בחברת יזמות" : "לדוגמה: מנהל/ת פרויקטים בנדל״ן"} />
                </div>

                <div className="pg-formgrid">
                  {SELECTS.map((s) => (
                    <div className="v6-field" key={s.id}>
                      <label htmlFor={`j-${s.id}`}>{s.label}</label>
                      <select id={`j-${s.id}`} name={s.id} required defaultValue="">
                        <option value="" disabled>{s.options[0]}</option>
                        {s.options.slice(1).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="v6-field">
                  <label htmlFor="j-desc">{seek ? "ספרו על עצמכם" : "תיאור המשרה"}</label>
                  <textarea id="j-desc" name="description" required placeholder={seek ? "ניסיון, תחומי מומחיות ואיזה תפקיד אתם מחפשים…" : "פרטו על התפקיד, האחריות ומה מחפשים…"} />
                </div>
                <div className="v6-field">
                  <label htmlFor="j-req">{seek ? "כישורים עיקריים" : "דרישות עיקריות"}</label>
                  <textarea id="j-req" name="requirements" placeholder="דרישה אחת בכל שורה…" />
                </div>
                <div className="v6-field">
                  <label htmlFor="j-tags">תגיות (מופרדות בפסיק)</label>
                  <input id="j-tags" name="tags" type="text" placeholder="ניסיון, תל אביב, משרה מלאה" />
                </div>

                <div className="pg-divider" style={{ margin: "8px 0" }} />
                <h2>פרטי מפרסם</h2>
                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="j-name">שם / חברה</label>
                    <input id="j-name" name="name" type="text" required placeholder="שם מלא או שם החברה" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-phone">טלפון</label>
                    <input id="j-phone" name="phone" type="tel" required placeholder="050-0000000" />
                  </div>
                  <div className="v6-field pg-full">
                    <label htmlFor="j-email">אימייל ליצירת קשר</label>
                    <input id="j-email" name="email" type="email" required placeholder="jobs@company.com" />
                  </div>
                </div>

                <p className="pg-privacy-note">הפרטים נשמרים כדי לפרסם את המודעה אחרי שהצוות יאשר אותה. מה שכתוב במודעה, כולל דרכי הקשר, יוצג לחברי הקהילה.</p>
                <label className="v6-contact__consent" htmlFor="j-consent">
                  <input id="j-consent" name="consent" value="1" type="checkbox" required />
                  <span>מוסכמים עלי <a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a> ותנאי הפרסום של הקהילה.</span>
                </label>

                <FormError error={state.error} />
                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
                  <span>{pending ? "שולחים…" : seek ? "פרסם חיפוש עבודה" : "פרסם משרה"}</span>
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
