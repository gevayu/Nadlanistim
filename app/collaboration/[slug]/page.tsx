"use client";

import { useParams } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import "../../collaborations/collaborations.css";
import { getCollab } from "../../collaborations/data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>);

// Israeli local number ("050-1234567") -> wa.me international form ("972501234567")
const waNumber = (phone: string) => "972" + phone.replace(/\D/g, "").replace(/^0/, "");

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
  </svg>
);

export default function CollaborationSinglePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const collab = slug ? getCollab(slug) : undefined;

  if (!collab) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>שיתוף הפעולה <em>לא נמצא</em></h1>
              <p>ייתכן שההזדמנות הוסרה או שהקישור שגוי.</p>
            </div>
            <div className="pg-cta-row">
              <a href="/collaborations" className="v6-btn v6-btn--primary v6-btn--lg"><span>חזרה ללוח שיתופי הפעולה</span><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const META = [
    { label: "סוג", val: collab.type },
    { label: "תפקיד נדרש", val: collab.looking },
    { label: "מיקום", val: collab.place },
    { label: "רמת השקעה", val: collab.invest },
    { label: "שלב", val: collab.stage },
    { label: "תאריך פרסום", val: collab.date },
  ];

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" style={{ maxWidth: 920 }} data-reveal>
            <figure className="co-cover">
              <img src={`https://images.unsplash.com/photo-${collab.img}?w=1400&q=80`} alt="" />
              <span className="co-cover__stage">שלב: {collab.stage}</span>
            </figure>

            <div className="pg-panel__head">
              <div className="pg-panel__title">
                <h1>{collab.title}</h1>
                <div className="pg-panel__by">פורסם על ידי <a href="/profile"><b>{collab.by}</b></a> · {collab.byRole}</div>
              </div>
            </div>

            <div className="co-meta-grid">
              {META.map((m) => (
                <div key={m.label} className="co-mi">
                  <div className="co-mi__label">{m.label}</div>
                  <div className="co-mi__val">{m.val}</div>
                </div>
              ))}
            </div>

            <div className="pg-block">
              <h2>תיאור הפרויקט</h2>
              {collab.description.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <div className="pg-block">
              <h2>מה מחפשים</h2>
              <ul className="pg-bullets">{collab.lookingList.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>

            <div className="pg-block">
              <h2>תגיות</h2>
              <div className="pg-tags">{collab.tags.map((t) => <span key={t} className="pg-tag">{t}</span>)}</div>
            </div>

            <div className="pg-block">
              <h2>פרטי יצירת קשר</h2>
              <div className="pg-contact-lines">
                <div><b>איש קשר:</b> {collab.by}</div>
                <div><b>אימייל:</b> <a href={`mailto:${collab.email}`}>{collab.email}</a></div>
                <div><b>טלפון:</b> {collab.phone}</div>
              </div>
              <a
                href={`https://wa.me/${waNumber(collab.phone)}?text=${encodeURIComponent(`היי ${collab.by}, ראיתי באתר הנדלניסטים את "${collab.title}" ואשמח לשמוע עוד.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="v6-btn v6-btn--primary v6-btn--lg"
                data-magnetic=""
                style={{ marginTop: 20 }}
              >
                <WhatsappIcon />
                <span>שליחת הודעה בוואטסאפ ל{collab.by}</span>
              </a>
            </div>

            <div className="pg-divider" />
            <div className="pg-actions">
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic=""><span>שתף רעיון</span><ShareIcon /></a>
              <a href="/collaborations" className="v6-btn v6-btn--glass">חזרה ללוח שיתופי הפעולה</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
