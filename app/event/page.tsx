"use client";

import SiteShell from "../v6/SiteShell";
import "./event.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>
);

const DETAILS = [
  { icon: "📅", label: "מתי", val: "יום ד׳, 15 ביוני 2026", sub: "18:30–20:30" },
  { icon: "📍", label: "איפה", val: "WeWork גינדי, ת״א", sub: "וגם אונליין בזום" },
  { icon: "💰", label: "כמה עולה", val: "חינם לחברי קהילה / 50₪", sub: "מספר מקומות מוגבל" },
  { icon: "👥", label: "למי זה מתאים", val: "יזמים, משקיעים ובעלי מקצוע", sub: "כל רמות הניסיון" },
];

const FEATURES = [
  { ic: "✨", t: "תוכן/כלי/שיטה", d: "תיאור קצר של הערך." },
  { ic: "🎯", t: "תרגול מעשי", d: "מה בדיוק נעשה." },
  { ic: "🤝", t: "נטוורקינג", d: "היכרות עם עוד נדלניסטים ורחבת רשת מקצועית." },
  { ic: "🎁", t: "חומרים לקחת הביתה", d: "מצגת + מסמכים." },
  { ic: "🧀", t: "אוכל/שתייה", d: "פיצה, בירה וחיבורים סביב." },
];

const AGENDA = [
  ["18:00–18:30", "התכנסות ונטוורקינג חופשי"],
  ["18:30–18:45", "פתיחה והיכרות"],
  ["18:45–19:30", "הרצאה + דוגמאות מהשטח"],
  ["19:30–20:00", "שאלות ותשובות + דיון פתוח"],
  ["20:00–20:30", "נטוורקינג וחיבורים"],
];

const TESTIMONIALS = [
  { q: "״האירוע היה פצצה! יצאתי עם 3 כלים חדשים שכבר יישמתי.״", by: "שירה אלוני, פרופטק" },
  { q: "״נהניתי כל רגע, חיבורים אמיתיים. תודה!״", by: "רן מימון, מנכ״ל" },
];

const FAQ = [
  "האירוע מתאים גם למתחילים?",
  "מה לעשות אם אני לא יכול/ה להגיע ברגע האחרון?",
  "האם האירוע מוקלט?",
  "האם יש חניה במקום?",
  "איך אפשר ליצור קשר לשאלות נוספות?",
];

export default function EventPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ev-hero" data-reveal>
            <span className="ev-badge">● אירוע קרוב</span>
            <h1>מאסטרקלאס: קרנות חוב פרטיות — <em>מרגש ומזמין</em></h1>
            <p>שלוש שעות עומק עם מנהלי שלוש הקרנות המובילות בארץ.</p>
            <a href="#register" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>שמרו לי מקום</span><ArrowIcon /></a>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="ev-details">
            {DETAILS.map((d) => (
              <div key={d.label} className="ev-detail v6-glass" data-reveal>
                <div className="ev-detail__icon">{d.icon}</div>
                <div className="ev-detail__label">{d.label}</div>
                <div className="ev-detail__val">{d.val}</div>
                <div className="ev-detail__sub">{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ev-section-title" data-reveal>מה מחכה לכם באירוע?</h2>
          <div className="ev-features">
            {FEATURES.map((f) => (
              <div key={f.t} className="ev-feature" data-reveal>
                <span className="ev-feature__ic">{f.ic}</span>
                <div><b>{f.t}</b><p>{f.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speaker */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ev-section-title" data-reveal>מי מעביר — על המנחה</h2>
          <div className="ev-speaker v6-glass" data-reveal>
            <div className="ev-speaker__img"><img src="https://i.pravatar.cc/320?img=53" alt="" /></div>
            <div>
              <h3>רן מימון</h3>
              <div className="ev-speaker__role">מנכ״ל, מימון בנייה</div>
              <p>בעל ניסיון של מעל 15 שנה בליווי וגיוס קרנות חוב פרטיות. ליווה עשרות עסקאות ופרויקטים, ומחזיק בהיכרות מעמיקה עם השוק המוסדי והפרטי כאחד.</p>
              <div className="ev-speaker__q">״הצלחה בנדל״ן מתחילה בהבנה אמיתית של הכסף שמאחורי העסקה.״</div>
              <a href="#" className="ev-speaker__link"><LinkedinIcon /> קראו עוד על רן</a>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ev-section-title" data-reveal>מה התוכנית?</h2>
          <div className="ev-agenda v6-glass" data-reveal style={{ padding: "8px 28px", borderRadius: "var(--r-lg)" }}>
            {AGENDA.map(([time, what]) => (
              <div key={time} className="ev-agenda__row">
                <span className="ev-agenda__time">{time}</span>
                <span className="ev-agenda__what">{what}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ev-section-title" data-reveal>מה אמרו באירועים הקודמים?</h2>
          <div className="ev-testi">
            {TESTIMONIALS.map((t) => (
              <article key={t.by} className="ev-testi__card v6-glass" data-reveal>
                <div className="ev-testi__q">{t.q}</div>
                <div className="ev-testi__by">— {t.by}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="ev-section-title" data-reveal>שאלות נפוצות</h2>
          <div className="ev-faq">
            {FAQ.map((q) => (
              <div key={q} className="ev-faq__item v6-glass" data-reveal><span className="ev-faq__q">?</span>{q}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Register band */}
      <section className="v6-section" id="register">
        <div className="v6-container">
          <div className="ev-band" data-reveal>
            <h2>אל תפספסו את ההזדמנות</h2>
            <p>מקומות מוגבלים · האירוע בעוד ימים ספורים.</p>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>כן, אני רוצה להשתתף</span><ArrowIcon /></a>
            <div className="ev-band__note">💡 חברי הקהילה מקבלים גישה מועדפת ורישום מהיר.</div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
