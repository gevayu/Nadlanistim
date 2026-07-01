"use client";

import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);

const BIO = [
  "אבי כהן הוא יזם נדל״ן ותיק עם למעלה מ‑20 שנות ניסיון בתחום. הוא החל את דרכו כמשקיע קטן והפך לאחד השמות המובילים בענף, עם פרויקטים מוצלחים למגורים ומסחר ברחבי הארץ. אבי ידוע בגישתו החדשנית ובמחויבותו לקהילה.",
  "מה שהביא אותי לקהילה הוא הרצון לחלוק ידע וניסיון עם דור היזמים הבא, וללמוד מנקודות מבט חדשות. אני מאמין בכוחה של קהילה תומכת ליצירת הזדמנויות וצמיחה הדדית.",
  "הישג מיוחד שאני גאה בו הוא פרויקט ״גני העיר״ בתל אביב, ששילב בנייה ירוקה עם עיצוב מודרני, והפך למודל לחיקוי בתעשייה.",
  "בתחביבים שלי אני אוהב לטייל בטבע, לקרוא ספרי היסטוריה ולשחק שחמט. אני מאמין שאיזון בין עבודה לחיים אישיים הוא המפתח להצלחה.",
];

export default function ProfilePage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-profile2__hero">
              <div className="pg-profile2__img">
                <img src="https://i.pravatar.cc/600?img=12" alt="אבי כהן" />
              </div>
              <div className="pg-profile2__text">
                <h1>אבי כהן</h1>
                <div className="pg-profile2__role">יזם נדל״ן ומנטור</div>
                <p className="pg-profile2__intro">{BIO[0]}</p>
              </div>
            </div>

            <div className="pg-block">
              <h2>קצת עליי</h2>
              {BIO.slice(1).map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <blockquote className="pg-quote2">״מאמין בכוחה של קהילה לשינוי וצמיחה אישית ומקצועית.״</blockquote>

            <div className="pg-social-wrap">
              <div className="pg-social-head">צרו קשר</div>
              <div className="pg-social">
                <a href="#" aria-label="LinkedIn"><LinkedinIcon /></a>
                <a href="#" aria-label="Instagram"><InstagramIcon /></a>
                <a href="mailto:avi@nadlanistim.co.il" aria-label="אימייל"><MailIcon /></a>
              </div>
            </div>

            <div className="pg-divider" />
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic=""><span>שתף פרופיל</span><ArrowIcon /></a>
              <a href="/nadlanistim" className="v6-btn v6-btn--glass">חזרה לרשימת הנדלניסטים</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
