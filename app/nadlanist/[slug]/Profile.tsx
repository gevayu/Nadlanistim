import SiteShell from "../../v6/SiteShell";
import "../../collaborations/collaborations.css";
import MembersLock from "../../collaborations/MembersLock";
import type { Session } from "../../../lib/auth";
import { type Nadlanist } from "../../nadlanistim/data";
import OpenToWorkRing from "../../v6/OpenToWorkRing";
import { telHref, waNumber } from "../../../lib/phone";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkedinIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>);
const PhoneIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M6.6 3.5l2.6.4 1.2 3.6-1.9 1.4a12 12 0 0 0 6.6 6.6l1.4-1.9 3.6 1.2.4 2.6c.1.9-.6 1.6-1.5 1.6A16.6 16.6 0 0 1 5 5c0-.9.7-1.6 1.6-1.5z" strokeLinejoin="round" /></svg>);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4 5.2 5.2 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>);
const MailIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>);

/**
 * A nadlanist's profile. `locked`: the visitor is not a paying member, so `n` holds the directory card only
 * (see publicCard) and the bio and contact part shows as MembersLock.
 */
export default function Profile({ n, locked, session, communities = [] }: {
  n?: Nadlanist;
  locked: boolean;
  session: Session | null;
  communities?: { slug: string; name: string }[];
}) {
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
    <SiteShell crumb={n.name}>
      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-profile2__hero">
              <div className="pg-profile2__img">
                <img src={n.photo} alt={n.openToWork ? `${n.name} · פתוח/ה להצעות עבודה` : n.name} />
                {n.openToWork && <OpenToWorkRing />}
              </div>
              <div className="pg-profile2__text">
                <h1>{n.name}</h1>
                <div className="pg-profile2__role">{n.role}</div>
                {locked ? n.quote && <p className="pg-profile2__intro">״{n.quote}״</p> : <p className="pg-profile2__intro">{n.bio[0]}</p>}
              </div>
            </div>

            {locked ? (
              <>
                <div className="co-meta-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 520, margin: "0 auto" }}>
                  <div className="co-mi"><div className="co-mi__label">תחום עיסוק</div><div className="co-mi__val">{n.field}</div></div>
                  <div className="co-mi"><div className="co-mi__label">מיקום</div><div className="co-mi__val">{n.place}</div></div>
                </div>
                <MembersLock session={session} next={`/nadlanist/${n.slug}`} />
              </>
            ) : (
              <>
                <div className="pg-block">
                  <h2>קצת עליי</h2>
                  {n.bio.slice(1).map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {n.quote && <blockquote className="pg-quote2">״{n.quote}״</blockquote>}

                <div className="co-meta-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 520, margin: "0 auto" }}>
                  <div className="co-mi"><div className="co-mi__label">תחום עיסוק</div><div className="co-mi__val">{n.field}</div></div>
                  <div className="co-mi"><div className="co-mi__label">מיקום</div><div className="co-mi__val">{n.place}</div></div>
                </div>

                {communities.length > 0 && (
                  <div className="pg-block" style={{ marginTop: 32 }}>
                    <h2>הקהילות שלי</h2>
                    <div className="pg-tags">
                      {communities.map((c) => <a key={c.slug} href={`/community/${c.slug}`} className="pg-tag">{c.name}</a>)}
                    </div>
                  </div>
                )}

                <div className="pg-social-wrap" style={{ marginTop: 32 }}>
                  <div className="pg-social-head">צרו קשר</div>
                  {n.phone && (
                    <div className="pg-actions pg-call" style={{ justifyContent: "center" }}>
                      <a href={telHref(n.phone)} className="v6-btn v6-btn--glass"><PhoneIcon /><span>חיוג</span></a>
                      <a
                        href={`https://wa.me/${waNumber(n.phone)}?text=${encodeURIComponent(`היי ${n.name}, ראיתי את הפרופיל שלך באתר הנדלניסטים.`)}`}
                        target="_blank" rel="noopener noreferrer" className="v6-btn v6-btn--primary"
                      ><WhatsappIcon /><span>WhatsApp</span></a>
                    </div>
                  )}
                  <div className="pg-social">
                    {n.linkedin && <a href={n.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>}
                    {n.instagram && <a href={n.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
                    {n.email && <a href={`mailto:${n.email}`} aria-label="אימייל"><MailIcon /></a>}
                  </div>
                </div>
              </>
            )}

            <div className="pg-divider" />
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="/nadlanistim" className="v6-btn v6-btn--glass">חזרה למדריך הנדלניסטים</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
