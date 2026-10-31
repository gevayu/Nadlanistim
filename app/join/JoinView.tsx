"use client";

import { useEffect } from "react";
import SiteShell from "../v6/SiteShell";
import "./join.css";
import { celebrate } from "../v6/confetti";
import type { Product } from "../../lib/store";
import { sendJoin } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HIGHLIGHTS = [
  { n: "3,200+", t: "חברים פעילים" },
  { n: "40+", t: "אירועים בשנה" },
  { n: "500+", t: "עסקאות ושת״פים" },
  { n: "25", t: "קהילות" },
];

// The period is the product's "תקופת חיוב" attribute in WooCommerce; a product without it shows the price alone.
const unitOf = (p: Product) => (p.period ? `₪ / ${p.period}` : "₪");

const TERMS = [
  "החברות בקהילה מיועדת לאנשי מקצוע ולעוסקים בתחום הנדל״ן.",
  "החברים מתחייבים לשיח מכבד ולשמירה על כבוד הדדי בכל הפלטפורמות.",
  "אין לפרסם תוכן מסחרי או פרסומי ללא אישור מראש מצוות הקהילה.",
  "שיתופי פעולה ועסקאות נעשים באחריות הצדדים בלבד - הקהילה אינה צד לעסקה.",
  "יש לשמור על סודיות המידע שנחשף במסגרת הקהילה ולא להעבירו לגורמים חיצוניים.",
  "דמי החברות מתחדשים אוטומטית בתום התקופה, וניתנים לביטול בכל עת דרך אזור החשבון.",
  "הפרה של התקנון עלולה להוביל להשעיה או להרחקה מהקהילה, ללא החזר דמי חברות.",
];

const FIELDS = ["בחרו…", "יזמות", "השקעות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות", "מימון", "פרופטק", "משפט"];
export default function JoinView({ plans }: { plans: Product[] }) {
  const { state, pending, onSubmit } = useFormSend(sendJoin);
  const sent = !!state.ok;
  useEffect(() => {
    if (sent) celebrate();
  }, [sent]);

  return (
    <SiteShell>
      {/* Head */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הצטרפו ל<em>נדלניסטים</em></h1>
            <p>הקהילה המובילה של אנשי הנדל״ן בישראל. כאן נפגשים, לומדים, סוגרים עסקאות וצומחים יחד.</p>
          </div>

          {/* About the community */}
          <div className="jn-about" data-reveal>
            <p>קהילת הנדלניסטים היא הבית של אנשי הנדל״ן בישראל - יזמים, משקיעים, מתווכים, אדריכלים, שמאים ואנשי מקצוע מכל התחומים. אלפי חברים, עשרות אירועים בשנה ומאות עסקאות ושיתופי פעולה שנולדו בזכות הקשרים שנוצרו כאן.</p>
            <p>כחברים תקבלו גישה מלאה ללוח העסקאות והמשרות, לקהילות הממוקדות, לאירועים ולהקלטות - ובעיקר, לרשת אנשים שפותחת דלתות.</p>
          </div>

          <div className="jn-highlights" data-reveal>
            {HIGHLIGHTS.map((h) => (
              <div key={h.t} className="jn-hl v6-glass"><b>{h.n}</b><span>{h.t}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (WooCommerce membership products) */}
      {plans.length > 0 && (
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="jn-title" data-reveal>עלות ההצטרפות</h2>
          <p className="jn-sub" data-reveal>בחרו את המסלול שמתאים לכם - אפשר לשדרג או לבטל בכל עת.</p>
          <div className="jn-plans">
            {plans.map((p) => (
              <div key={p.id} className={`jn-plan v6-glass${p.featured ? " jn-plan--featured" : ""}`} data-reveal>
                {p.featured && <span className="jn-plan__badge">הכי משתלם</span>}
                <div className="jn-plan__name">{p.name}</div>
                <div className="jn-plan__price"><b>{p.price.toLocaleString("he-IL")}</b><span>{unitOf(p)}</span></div>
                {p.note && <div className="jn-plan__note">{p.note}</div>}
                <ul className="jn-plan__feats">
                  {p.features.map((f) => <li key={f}><CheckIcon />{f}</li>)}
                </ul>
                <a href={`/checkout?product=${p.id}`} className={`v6-btn ${p.featured ? "v6-btn--primary" : "v6-btn--glass"}`} data-magnetic="">
                  <span>בחרו {p.name}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Terms */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="jn-title" data-reveal>תקנון הקהילה</h2>
          <p className="jn-sub" data-reveal>כמה כללים פשוטים ששומרים על קהילה איכותית ומכבדת.</p>
          <div className="jn-terms">
            {TERMS.map((t, i) => (
              <div key={t} className="jn-term v6-glass" data-reveal><span className="jn-term__n">{i + 1}</span><p>{t}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="v6-section" id="join-form">
        <div className="v6-container">
          <h2 className="jn-title" data-reveal>טופס הצטרפות</h2>
          <p className="jn-sub" data-reveal>מלאו את הפרטים ונחזור אליכם להשלמת ההצטרפות והתשלום.</p>

          <article className="pg-panel v6-glass" style={{ maxWidth: 760 }} data-reveal>
            {sent ? (
              <div className="pg-sent" role="status">קיבלנו את הבקשה. ניצור איתכם קשר להשלמת ההצטרפות והתשלום.</div>
            ) : (
              <form className="pg-form" onSubmit={onSubmit}>
                <Honeypot />
                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="j-name">שם מלא</label>
                    <input id="j-name" name="name" type="text" required autoComplete="name" placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-email">אימייל</label>
                    <input id="j-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-phone">טלפון</label>
                    <input id="j-phone" name="phone" type="tel" required autoComplete="tel" placeholder="050-0000000" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-field">תחום עיסוק</label>
                    <select id="j-field" name="field" required defaultValue="">
                      <option value="" disabled>{FIELDS[0]}</option>
                      {FIELDS.slice(1).map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  {plans.length > 0 && (
                    <div className="v6-field pg-full">
                      <label htmlFor="j-plan">מסלול חברות</label>
                      <select id="j-plan" name="track" required defaultValue="">
                        <option value="" disabled>בחרו…</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.name}>{`${p.name} - ${p.price.toLocaleString("he-IL")} ${unitOf(p)}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="v6-field">
                  <label htmlFor="j-msg">כמה מילים עליכם (אופציונלי)</label>
                  <textarea id="j-msg" name="about" placeholder="ספרו לנו על עצמכם ועל מה שאתם מחפשים בקהילה…" />
                </div>

                <label className="v6-contact__consent" htmlFor="j-consent">
                  <input id="j-consent" name="consent" value="1" type="checkbox" required />
                  <span>קראתי ואני מסכים/ה לתקנון הקהילה ולמדיניות הפרטיות.</span>
                </label>

                <FormError error={state.error} />
                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
                  <span>{pending ? "שולחים…" : "שלחו בקשת הצטרפות"}</span>
                  <ArrowIcon />
                </button>
              </form>
            )}
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
