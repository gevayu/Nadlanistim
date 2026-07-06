"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";
import "./join.css";

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
  { n: "25", t: "תת־קהילות" },
];

const PLANS = [
  {
    name: "חברות חודשית",
    price: "99",
    unit: "₪ / חודש",
    note: "ללא התחייבות — בטלו בכל עת",
    featured: false,
    feats: ["גישה מלאה ללוח העסקאות והמשרות", "כניסה לקבוצות ולתת־הקהילות", "השתתפות באירועים ובמפגשים"],
    cta: "בחרו חודשי",
  },
  {
    name: "חברות שנתית",
    price: "890",
    unit: "₪ / שנה",
    note: "חיסכון של כ־25% — 2 חודשים מתנה",
    featured: true,
    feats: [
      "כל מה שבמסלול החודשי",
      "גישה מוקדמת לעסקאות בלעדיות",
      "הקלטות מלאות של כל האירועים",
      "פרופיל מודגש במדריך הנדלניסטים",
    ],
    cta: "בחרו שנתי",
  },
];

const TERMS = [
  "החברות בקהילה מיועדת לאנשי מקצוע ולעוסקים בתחום הנדל״ן.",
  "החברים מתחייבים לשיח מכבד ולשמירה על כבוד הדדי בכל הפלטפורמות.",
  "אין לפרסם תוכן מסחרי או פרסומי ללא אישור מראש מצוות הקהילה.",
  "שיתופי פעולה ועסקאות נעשים באחריות הצדדים בלבד — הקהילה אינה צד לעסקה.",
  "יש לשמור על סודיות המידע שנחשף במסגרת הקהילה ולא להעבירו לגורמים חיצוניים.",
  "דמי החברות מתחדשים אוטומטית בתום התקופה, וניתנים לביטול בכל עת דרך אזור החשבון.",
  "הפרה של התקנון עלולה להוביל להשעיה או להרחקה מהקהילה, ללא החזר דמי חברות.",
];

const FIELDS = ["בחרו…", "יזמות", "השקעות", "שיווק", "ייעוץ", "אדריכלות", "תיווך", "שמאות", "מימון", "פרופטק", "משפט"];
const PLAN_OPTS = ["בחרו…", "חברות שנתית — ₪890", "חברות חודשית — ₪99"];

export default function JoinPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      {/* Head */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הצטרפו ל<em>הנדלניסטים</em></h1>
            <p>הקהילה המובילה של אנשי הנדל״ן בישראל. כאן נפגשים, לומדים, סוגרים עסקאות וצומחים יחד.</p>
          </div>

          {/* About the community */}
          <div className="jn-about" data-reveal>
            <p>קהילת הנדלניסטים היא הבית של אנשי הנדל״ן בישראל — יזמים, משקיעים, מתווכים, אדריכלים, שמאים ואנשי מקצוע מכל התחומים. אלפי חברים, עשרות אירועים בשנה ומאות עסקאות ושיתופי פעולה שנולדו בזכות הקשרים שנוצרו כאן.</p>
            <p>כחברים תקבלו גישה מלאה ללוח העסקאות והמשרות, לתת־הקהילות הממוקדות, לאירועים ולהקלטות — ובעיקר, לרשת אנשים שפותחת דלתות.</p>
          </div>

          <div className="jn-highlights" data-reveal>
            {HIGHLIGHTS.map((h) => (
              <div key={h.t} className="jn-hl v6-glass"><b>{h.n}</b><span>{h.t}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="jn-title" data-reveal>עלות ההצטרפות</h2>
          <p className="jn-sub" data-reveal>בחרו את המסלול שמתאים לכם — אפשר לשדרג או לבטל בכל עת.</p>
          <div className="jn-plans">
            {PLANS.map((p) => (
              <div key={p.name} className={`jn-plan v6-glass${p.featured ? " jn-plan--featured" : ""}`} data-reveal>
                {p.featured && <span className="jn-plan__badge">הכי משתלם</span>}
                <div className="jn-plan__name">{p.name}</div>
                <div className="jn-plan__price"><b>{p.price}</b><span>{p.unit}</span></div>
                <div className="jn-plan__note">{p.note}</div>
                <ul className="jn-plan__feats">
                  {p.feats.map((f) => <li key={f}><CheckIcon />{f}</li>)}
                </ul>
                <a href="#join-form" className={`v6-btn ${p.featured ? "v6-btn--primary" : "v6-btn--glass"}`} data-magnetic="">
                  <span>{p.cta}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="jn-title" data-reveal>תקנון הקהילה</h2>
          <p className="jn-sub" data-reveal>כמה כללים פשוטים ששומרים על קהילה איכותית ומכבדת.</p>
          <div className="jn-terms">
            {TERMS.map((t) => (
              <div key={t} className="jn-term v6-glass" data-reveal><p>{t}</p></div>
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
              <div className="pg-sent">הבקשה נשלחה! ✓ ניצור איתכם קשר בהקדם להשלמת ההצטרפות והתשלום.</div>
            ) : (
              <form className="pg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="pg-formgrid">
                  <div className="v6-field">
                    <label htmlFor="j-name">שם מלא</label>
                    <input id="j-name" type="text" required placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-email">אימייל</label>
                    <input id="j-email" type="email" required placeholder="you@email.com" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-phone">טלפון</label>
                    <input id="j-phone" type="tel" required placeholder="050-0000000" />
                  </div>
                  <div className="v6-field">
                    <label htmlFor="j-field">תחום עיסוק</label>
                    <select id="j-field" required defaultValue="">
                      <option value="" disabled>{FIELDS[0]}</option>
                      {FIELDS.slice(1).map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="v6-field pg-full">
                    <label htmlFor="j-plan">מסלול חברות</label>
                    <select id="j-plan" required defaultValue="">
                      <option value="" disabled>{PLAN_OPTS[0]}</option>
                      {PLAN_OPTS.slice(1).map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="v6-field">
                  <label htmlFor="j-msg">כמה מילים עליכם (אופציונלי)</label>
                  <textarea id="j-msg" placeholder="ספרו לנו על עצמכם ועל מה שאתם מחפשים בקהילה…" />
                </div>

                <label className="v6-contact__consent" htmlFor="j-consent">
                  <input id="j-consent" type="checkbox" required />
                  <span>קראתי ואני מסכים/ה לתקנון הקהילה ולמדיניות הפרטיות.</span>
                </label>

                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" data-magnetic="">
                  <span>שלחו בקשת הצטרפות</span>
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
