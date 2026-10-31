"use client";

import SiteShell from "../v6/SiteShell";
import "../collaborations/collaborations.css";
import { sendCollab } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import ImageField from "../forms/ImageField";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SELECTS: { id: string; label: string; options: string[] }[] = [
  { id: "type", label: "סוג שיתוף הפעולה", options: ["בחרו…", "התחדשות עירונית", "קרקע", "בנייה", "שיפוצים", "השקעות", "טכנולוגיה"] },
  { id: "role", label: "תפקיד נדרש", options: ["בחרו…", "שותף פיננסי", "שותף מקצועי", "שותף לעסקת יזמות", "קבלן", "יועץ", "שותף לקרקע", "משקיע שותף"] },
  { id: "area", label: "אזור", options: ["בחרו…", "צפון", "שרון", "מרכז", "דרום", "ירושלים", "כל הארץ", "מרחוק"] },
  { id: "invest", label: "רמת השקעה", options: ["בחרו…", "עד 100K", "עד 500K", "מיליון+", "ללא השקעה כספית"] },
  { id: "stage", label: "שלב הפרויקט", options: ["בחרו…", "רעיון", "תכנון", "בנייה", "ביצוע", "מתקדם"] },
];

export default function CollaborationNewPage() {
  const { state, pending, onSubmit } = useFormSend(sendCollab);
  const sent = !!state.ok;

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
              <form className="pg-form" onSubmit={onSubmit}>
                <Honeypot />
                <div className="v6-field">
                  <label htmlFor="n-title">כותרת הפרויקט / הרעיון</label>
                  <input id="n-title" name="title" type="text" required placeholder="לדוגמה: פינוי-בינוי, גבעת שמואל" />
                </div>

                <div className="co-formgrid">
                  {SELECTS.map((s) => (
                    <div className="v6-field" key={s.id}>
                      <label htmlFor={`n-${s.id}`}>{s.label}</label>
                      <select id={`n-${s.id}`} name={s.id} required defaultValue="">
                        <option value="" disabled>{s.options[0]}</option>
                        {s.options.slice(1).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="v6-field">
                  <label htmlFor="n-desc">תיאור מפורט</label>
                  <textarea id="n-desc" name="description" required placeholder="ספרו על הפרויקט, מה כבר קיים, ומה אתם מחפשים מהשותף/ה…" />
                </div>

                <div className="v6-field co-full">
                  <ImageField id="n-img" label="תמונת הפרויקט (אופציונלי)" boxClass="co-upload" />
                </div>

                <div className="pg-divider" style={{ margin: "8px 0" }} />
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>פרטי יצירת קשר</h2>
                <div className="co-formgrid">
                  <div className="v6-field">
                    <label htmlFor="n-name">שם מלא</label>
                    <input id="n-name" name="name" type="text" required placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="n-phone">טלפון</label>
                    <input id="n-phone" name="phone" type="tel" required placeholder="050-0000000" />
                  </div>
                  <div className="v6-field co-full">
                    <label htmlFor="n-email">אימייל</label>
                    <input id="n-email" name="email" type="email" required placeholder="you@email.com" />
                  </div>
                </div>

                <p className="pg-privacy-note">הפרטים נשמרים כדי לפרסם את ההצעה אחרי שהצוות יאשר אותה. מה שכתוב בהצעה, כולל דרכי הקשר, יוצג לחברי הקהילה.</p>
                <label className="v6-contact__consent" htmlFor="n-consent">
                  <input id="n-consent" name="consent" value="1" type="checkbox" required />
                  <span>מוסכמים עלי <a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a> ותנאי הפרסום של הקהילה.</span>
                </label>

                <FormError error={state.error} />
                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
                  <span>{pending ? "שולחים…" : "פרסם שיתוף פעולה"}</span>
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
