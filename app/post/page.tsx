"use client";

import SiteShell from "../v6/SiteShell";
import "./post.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>);
const LinkIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const TAGS = ["מיסוי", "התחדשות עירונית", "רגולציה", "מס שבח"];

const RELATED = [
  { img: "1554469384-e58fac16e23a", cat: "מימון", title: "איך קוראים דוח אפס בלי ללכת לאיבוד" },
  { img: "1545324418-cc1a3fa10c00", cat: "משפט", title: "פינוי־בינוי מול תמ״א 38 — מה עדיף" },
  { img: "1582407947304-fd86f028f716", cat: "השקעות", title: "השקעה בפריפריה — מתי זה משתלם" },
];

export default function PostPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="post-hero" data-reveal>
            <span className="post-cat">רגולציה</span>
            <h1>מיסוי מקרקעין 2026 — <em>מה השתנה ולמי זה משנה</em></h1>
            <div className="post-meta">
              <span className="post-meta__av" style={{ backgroundImage: "url(https://i.pravatar.cc/64?img=33)" }} />
              <b>עו״ד דניאל כהן</b>
              <span className="post-meta__sep">·</span><span>יוני 2026</span>
              <span className="post-meta__sep">·</span><span>9 דק׳ קריאה</span>
            </div>
          </div>

          <figure className="post-cover" data-reveal>
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" alt="" />
          </figure>

          {/* Body */}
          <article className="post-body" data-reveal>
            <p>רפורמת המיסוי שנכנסה לתוקף בתחילת 2026 משנה את כללי המשחק עבור משקיעים, יזמים ובעלי דירות. בין אם אתם מחזיקים נכס יחיד או תיק נכסים שלם — כדאי להבין מה השתנה לפני העסקה הבאה.</p>
            <p>במאמר הזה נפרק את השינויים המרכזיים, נסביר למי הם רלוונטיים, ונראה איך לתכנן את המהלכים בצורה חכמה כדי לא לשלם מס מיותר.</p>

            <h2>מה השתנה <em>במס השבח</em></h2>
            <p>המדרגות עודכנו, והפטור הליניארי קיבל הגדרה מחודשת. עבור מי שמכר דירה שנייה, ההשפעה יכולה להגיע לעשרות אלפי שקלים — לכאן או לכאן.</p>
            <ul>
              <li>עדכון מדרגות המס לפי שווי העסקה.</li>
              <li>שינוי בתנאי הפטור לדירה יחידה.</li>
              <li>הקלות ממוקדות לפרויקטים של התחדשות עירונית.</li>
            </ul>

            <blockquote className="post-quote">״התכנון המיסויי הנכון מתחיל הרבה לפני החתימה — הוא מתחיל ברגע שאתם שוקלים לקנות.״</blockquote>

            <h2>למי זה <em>באמת משנה</em></h2>
            <p>למשקיעים מרובי־נכסים, ליזמי התחדשות עירונית ולמוכרי דירה שנייה — שלושת אלה ירגישו את השינוי הכי חזק. השורה התחתונה: בדיקה מקדימה עם איש מקצוע יכולה לחסוך הרבה כסף וכאב ראש.</p>

            <figure className="post-figure">
              <img src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&q=80" alt="" />
              <figcaption>ליווי מקצועי בעסקה — ההבדל בין רווח לרווח גדול יותר.</figcaption>
            </figure>
          </article>

          {/* Tags */}
          <div className="post-tags" data-reveal>
            {TAGS.map((t) => <span key={t} className="pg-tag">{t}</span>)}
          </div>

          {/* Author */}
          <div className="post-author v6-glass" data-reveal>
            <div className="post-author__av" style={{ backgroundImage: "url(https://i.pravatar.cc/120?img=33)" }} />
            <div>
              <div className="post-author__name">עו״ד דניאל כהן</div>
              <div className="post-author__role">משרד כהן ושות׳ · מיסוי נדל״ן</div>
              <p>מלווה עסקאות נדל״ן, התחדשות עירונית ומיסוי מקרקעין מעל 12 שנה. חבר פעיל בקהילת הנדלניסטים.</p>
            </div>
          </div>

          {/* Share */}
          <div className="post-share" data-reveal>
            <a href="/post-archive" className="v6-btn v6-btn--glass">חזרה לבית הידע</a>
            <div className="post-share__btns">
              <a href="#" aria-label="שיתוף בוואטסאפ"><WhatsappIcon /></a>
              <a href="#" aria-label="שיתוף בלינקדאין"><LinkedinIcon /></a>
              <a href="#" aria-label="העתק קישור"><LinkIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="pg-subhead" data-reveal>עוד מבית הידע</h2>
          <div className="pg-grid">
            {RELATED.map((r) => (
              <article key={r.title} className="pg-imgcard v6-glass" data-reveal>
                <figure className="pg-imgcard__img"><img src={`https://images.unsplash.com/photo-${r.img}?w=800&q=80`} alt="" /></figure>
                <div className="pg-imgcard__body">
                  <div className="pg-imgcard__meta">{r.cat}</div>
                  <h3>{r.title}</h3>
                  <a href="/post" className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>קרא עוד</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
