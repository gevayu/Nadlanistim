"use client";

import SiteShell from "../v6/SiteShell";
import "./event-recap.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const GALLERY = ["1540575467063-178a50c2df87", "1511795409834-ef04bbd61622", "1505373877841-8d25f7d46678", "1556761175-5973dc0f32e7", "1559223607-a43c990c692c", "1591115765373-5207764f72e7"];

const TAKEAWAYS = [
  { t: "השוק מתאזן — ההזדמנויות עוברות לפריפריה", d: "הנתונים שהוצגו מראים שינוי ברור באזורי הביקוש, עם פוטנציאל תשואה גבוה מחוץ למרכז." },
  { t: "מימון חכם מנצח מימון זול", d: "מבנה העסקה והגמישות מול הבנקים חשובים לא פחות מהריבית עצמה." },
  { t: "קהילה היא יתרון תחרותי", d: "רוב העסקאות שנסגרו השנה התחילו מהיכרות אישית בתוך הקהילה." },
];

const TESTIMONIALS = [
  { q: "״פשוט שווה כל דקה.״", name: "נועה ברגר", role: "יזמית", img: 47 },
  { q: "״האירוע היה מועיל, למדתי המון.״", name: "רן מימון", role: "מנכ״ל", img: 53 },
  { q: "״חיבורים שהתחילו ויהפכו לעסקאות.״", name: "שירה אלוני", role: "מייסדת", img: 24 },
  { q: "״אני כבר מחכה לאירוע הבא.״", name: "אלון שמיר", role: "סמנכ״ל", img: 12 },
];

const DOWNLOADS = [
  "מצבת האירוע (PDF)",
  "רשימת משימות ליישום (Checklist)",
  "קישורים וכלים שהוזכרו (Link List)",
];

export default function EventRecapPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="rc-hero" data-reveal>
            <span className="rc-badge">✓ האירוע הסתיים</span>
            <h1>כנס הנדלניסטים — <em>תודה שהייתם איתנו</em></h1>
            <p>יום שלם של פאנלים, עסקאות ונטוורקינג. ריכזנו לכם את כל הרגעים, התובנות והחומרים במקום אחד.</p>
            <a href="#" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>צפו בהקלטה המלאה</span><ArrowIcon /></a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>רגעים מהאירוע</h2>
          <div className="rc-gallery">
            {GALLERY.map((g) => (
              <figure key={g} data-reveal><img src={`https://images.unsplash.com/photo-${g}?w=700&q=80`} alt="" /></figure>
            ))}
          </div>
          <div className="rc-center-cta" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--glass v6-btn--lg">רוצים לקבל את כל התמונות? הצטרפו לקהילה!</a>
          </div>
        </div>
      </section>

      {/* Takeaways */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>מה למדנו? התובנות המרכזיות</h2>
          <div className="rc-num">
            {TAKEAWAYS.map((it, i) => (
              <div key={it.t} className="rc-num__item v6-glass" data-reveal>
                <div className="rc-num__n">{i + 1}</div>
                <div className="rc-num__t"><b>{it.t}</b><p>{it.d}</p></div>
              </div>
            ))}
          </div>
          <div className="rc-center-cta" data-reveal>
            <a href="#" className="v6-btn v6-btn--primary"><span>הורידו את מצגת האירוע (PDF)</span><DownloadIcon /></a>
          </div>
        </div>
      </section>

      {/* Highlights video */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>🎬 לא הצלחתם להגיע? הנה רגעי השיא</h2>
          <div className="rc-video v6-glass" data-reveal>
            <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&q=80" alt="" />
            <button className="rc-video__play" aria-label="נגן וידאו"><PlayIcon /></button>
          </div>
          <p className="rc-lock" data-reveal>🔒 הקלטות מלאות זמינות לחברי הקהילה</p>
          <div className="rc-center-cta" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הצטרפו לעדכון המנויים</span><ArrowIcon /></a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>מה אמרו המשתתפים?</h2>
          <div className="rc-testi">
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="rc-testi__card v6-glass" data-reveal>
                <div className="rc-testi__q">{t.q}</div>
                <div className="rc-testi__by">
                  <div className="rc-testi__av" style={{ backgroundImage: `url(https://i.pravatar.cc/80?img=${t.img})` }} />
                  <div>
                    <div className="rc-testi__name">{t.name}</div>
                    <div className="rc-testi__role">{t.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>לקחת אתכם הביתה</h2>
          <div className="rc-downloads">
            {DOWNLOADS.map((d) => (
              <a key={d} href="#" className="rc-dl v6-glass" data-reveal><DownloadIcon />{d}</a>
            ))}
          </div>
          <form className="rc-email" data-reveal onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="כתובת אימייל" aria-label="כתובת אימייל" />
            <button type="submit" className="v6-btn v6-btn--primary">שלחו לי את החומרים</button>
          </form>
        </div>
      </section>

      {/* Blue band */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="rc-band" data-reveal>
            <h2>נהנתם? הנה מה שאפשר לעשות עכשיו</h2>
            <div className="rc-band__btns">
              <a href="/event" className="v6-btn v6-btn--primary v6-btn--lg">שמרו מקום לאירוע הבא</a>
              <a href="#" className="v6-btn v6-btn--glass v6-btn--lg">הצטרפו לקבוצת הוואטסאפ</a>
              <a href="/#contact" className="v6-btn v6-btn--glass v6-btn--lg">הצטרפו לקהילה</a>
            </div>
          </div>
        </div>
      </section>

      {/* Next event */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="rc-section-title" data-reveal>▶▶ האירוע הבא שלנו:</h2>
          <div className="rc-next v6-glass" data-reveal>
            <div className="rc-next__img"><img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&q=80" alt="" /></div>
            <div className="rc-next__body">
              <div className="rc-next__date">14 ביוני 2026 · תל אביב</div>
              <h3>מאסטרקלאס — קרנות חוב פרטיות</h3>
              <a href="/event" className="v6-btn v6-btn--primary"><span>שמרו לי מקום</span><ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
