"use client";

import SiteShell from "../v6/SiteShell";
import { sendNadlanist } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import ImageField from "../forms/ImageField";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SELECTS: { id: string; label: string; options: string[] }[] = [
  { id: "field", label: "תחום עיסוק", options: ["בחרו…", "יזמות", "השקעות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות", "מימון", "פרופטק", "משפט"] },
  { id: "area", label: "מיקום", options: ["בחרו…", "תל אביב", "מרכז", "צפון", "דרום", "ירושלים", "כל הארץ"] },
];

export default function NadlanistNewPage() {
  const { state, pending, onSubmit } = useFormSend(sendNadlanist);
  const sent = !!state.ok;

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הצטרפו למדריך <em>הנדלניסטים</em></h1>
            <p>שתפו את הסיפור שלכם והופיעו באינדקס הנדלניסטים של הקהילה. ככה חברים אחרים ימצאו אתכם, את השירותים ואת הניסיון שלכם.</p>
          </div>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            {sent ? (
              <div className="pg-sent">הפרופיל נשלח לאישור. ✓ הוא יופיע במדריך הנדלניסטים תוך 48 שעות.</div>
            ) : (
              <form className="pg-form" onSubmit={onSubmit}>
                <Honeypot />
                <div className="v6-field pg-full">
                  <ImageField id="p-img" label="תמונת פרופיל" boxClass="pg-upload" />
                </div>

                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="p-name">שם מלא</label>
                    <input id="p-name" name="name" type="text" required placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="p-role">תפקיד / כותרת</label>
                    <input id="p-role" name="role" type="text" required placeholder="לדוגמה: יזם נדל״ן ומנטור" />
                  </div>
                  {SELECTS.map((s) => (
                    <div className="v6-field" key={s.id}>
                      <label htmlFor={`p-${s.id}`}>{s.label}</label>
                      <select id={`p-${s.id}`} name={s.id} required defaultValue="">
                        <option value="" disabled>{s.options[0]}</option>
                        {s.options.slice(1).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="v6-field">
                  <label htmlFor="p-quote">ציטוט אישי (מוצג בכרטיס)</label>
                  <input id="p-quote" name="quote" type="text" required placeholder="״מאמין בכוחה של קהילה לשינוי וצמיחה.״" />
                </div>
                <div className="v6-field">
                  <label htmlFor="p-bio">קצת עליי</label>
                  <textarea id="p-bio" name="bio" required placeholder="ספרו על עצמכם, על הניסיון ועל מה שאתם מביאים לקהילה…" />
                </div>

                <div className="pg-divider" style={{ margin: "8px 0" }} />
                <h2>פרטי יצירת קשר</h2>
                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="p-email">אימייל</label>
                    <input id="p-email" name="email" type="email" required placeholder="you@email.com" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="p-phone">טלפון</label>
                    <input id="p-phone" name="phone" type="tel" placeholder="050-0000000" />
                  </div>
                  <div className="v6-field pg-full">
                    <label htmlFor="p-linkedin">לינקדאין (אופציונלי)</label>
                    <input id="p-linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/…" />
                  </div>
                </div>

                <label className="v6-contact__consent" htmlFor="p-consent">
                  <input id="p-consent" name="consent" value="1" type="checkbox" required />
                  <span>מאשר/ת הצגת הפרטים במדריך הנדלניסטים ומסכים/ה ל<a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a>. הפרופיל יעלה למדריך אחרי אישור הצוות.</span>
                </label>

                <FormError error={state.error} />
                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
                  <span>{pending ? "שולחים…" : "הצטרפו למדריך"}</span>
                  <ArrowIcon />
                </button>
              </form>
            )}
          </article>

          <div className="pg-cta-row" data-reveal>
            <a href="/nadlanistim" className="v6-btn v6-btn--glass v6-btn--lg">חזרה למדריך הנדלניסטים</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
