"use client";

import { useParams } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import "../../collaborations/collaborations.css";
import { getNadlanist } from "../../nadlanistim/data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>);
const MailIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>);

export default function NadlanistSinglePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const n = slug ? getNadlanist(slug) : undefined;

  if (!n) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>הנדלניסט <em>לא נמצא</em></h1>
              <p>ייתכן שהקישור שגוי.</p>
            </div>
            <div className="pg-cta-row">
              <a href="/nadlanistim" className="v6-btn v6-btn--primary v6-btn--lg"><span>חזרה למדריך הנדלניסטים</span><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-profile2__hero">
              <div className="pg-profile2__img">
                <img src={`https://i.pravatar.cc/600?img=${n.img}`} alt={n.name} />
              </div>
              <div className="pg-profile2__text">
                <h1>{n.name}</h1>
                <div className="pg-profile2__role">{n.role}</div>
                <p className="pg-profile2__intro">{n.bio[0]}</p>
              </div>
            </div>

            <div className="pg-block">
              <h2>קצת עליי</h2>
              {n.bio.slice(1).map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <blockquote className="pg-quote2">״{n.quote}״</blockquote>

            <div className="co-meta-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 520, margin: "0 auto" }}>
              <div className="co-mi"><div className="co-mi__label">תחום עיסוק</div><div className="co-mi__val">{n.field}</div></div>
              <div className="co-mi"><div className="co-mi__label">מיקום</div><div className="co-mi__val">{n.place}</div></div>
            </div>

            <div className="pg-social-wrap" style={{ marginTop: 32 }}>
              <div className="pg-social-head">צרו קשר</div>
              <div className="pg-social">
                <a href="#" aria-label="LinkedIn"><LinkedinIcon /></a>
                <a href="#" aria-label="Instagram"><InstagramIcon /></a>
                <a href={`mailto:${n.email}`} aria-label="אימייל"><MailIcon /></a>
              </div>
            </div>

            <div className="pg-divider" />
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic=""><span>שתף פרופיל</span><ArrowIcon /></a>
              <a href="/nadlanistim" className="v6-btn v6-btn--glass">חזרה למדריך הנדלניסטים</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
