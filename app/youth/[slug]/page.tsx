"use client";

import { useParams } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import "../youth.css";
import "../../collaborations/collaborations.css";
import { getMember, MEMBERS } from "../data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>);
const MailIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>);

export default function YouthMemberPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const m = slug ? getMember(slug) : undefined;

  if (!m) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>חבר/ת הנבחרת <em>לא נמצא/ה</em></h1>
              <p>ייתכן שהקישור שגוי.</p>
            </div>
            <div className="pg-cta-row">
              <a href="/youth" className="v6-btn v6-btn--primary v6-btn--lg"><span>חזרה לנבחרת</span><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const others = MEMBERS.filter((x) => x.slug !== m.slug).slice(0, 4);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <a href="/youth" className="yt-back" data-reveal>→ נבחרת הנדלניסטים הצעירים</a>

          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-profile2__hero">
              <div className="pg-profile2__img">
                <img src={`https://i.pravatar.cc/600?img=${m.img}`} alt={m.name} />
              </div>
              <div className="pg-profile2__text">
                <span className="yt-badge" style={{ marginBottom: 16 }}>● חבר/ת נבחרת</span>
                <h1>{m.name}</h1>
                <div className="pg-profile2__role">{m.role} · {m.place}</div>
                <p className="pg-profile2__intro">{m.oneLiner}</p>
                <div className="yt-tags">
                  {m.focus.map((f) => <span key={f} className="pg-tag">{f}</span>)}
                </div>
              </div>
            </div>

            <div className="pg-block">
              <h2>הסיפור</h2>
              {m.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {/* Full-width photo */}
            <figure className="yt-fullimg">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80&auto=format&fit=crop" alt="" />
            </figure>

            <blockquote className="pg-quote2">״{m.quote}״</blockquote>

            {/* Video */}
            <div className="pg-block">
              <h2>בווידאו</h2>
              <div className="yt-video">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4"
                  title="וידאו"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="pg-social-wrap" style={{ marginTop: 32 }}>
              <div className="pg-social-head">צרו קשר</div>
              <div className="pg-social">
                <a href="#" aria-label="LinkedIn"><LinkedinIcon /></a>
                <a href="#" aria-label="Instagram"><InstagramIcon /></a>
                <a href={`mailto:${m.email}`} aria-label="אימייל"><MailIcon /></a>
              </div>
            </div>

            <div className="pg-divider" />
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic=""><span>שתף פרופיל</span><ArrowIcon /></a>
              <a href="/youth" className="v6-btn v6-btn--glass">חזרה לנבחרת</a>
            </div>
          </article>
        </div>
      </section>

      {/* Other team members */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="yt-section-title" data-reveal>עוד מהנבחרת</h2>
          <div className="yt-members">
            {others.map((o) => (
              <a key={o.slug} href={`/youth/${o.slug}`} className="yt-member v6-glass" data-reveal>
                <div className="yt-member__av"><img src={`https://i.pravatar.cc/320?img=${o.img}`} alt={o.name} /></div>
                <div className="yt-member__info">
                  <div className="yt-member__name">{o.name}</div>
                  <div className="yt-member__role">{o.role} · {o.place}</div>
                  <p className="yt-member__line">{o.oneLiner}</p>
                  <span className="yt-member__more">לפרופיל המלא <ArrowIcon /></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
