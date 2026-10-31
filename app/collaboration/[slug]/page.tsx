import SiteShell from "../../v6/SiteShell";
import "../../collaborations/collaborations.css";
import MembersLock from "../../collaborations/MembersLock";
import HiddenName from "../../collaborations/HiddenName";
import { getCollabs } from "../../collaborations/wp";
import { getSession } from "../../../lib/auth";
import { guard } from "@/lib/paywall";
import { waNumber } from "../../../lib/phone";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>);


export default async function CollaborationSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const [collabs, session, { locked }] = await Promise.all([getCollabs(), getSession(), guard("collabPage", `/collaboration/${slug}`)]);
  const collab = collabs.find((c) => c.slug === slug);
  // Members only by default ("חומת תשלום"). The open part is what the board card already shows; the rest renders only when unlocked.

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
  ].filter((m) => m.val);

  return (
    <SiteShell crumb={collab.title}>
      <section className="v6-section">
        <div className="v6-container">
          <article className="pg-panel v6-glass" style={{ maxWidth: 920 }} data-reveal>
            {collab.img && (
              <figure className="co-cover">
                <img src={collab.img} alt="" />
                {collab.stage && <span className="co-cover__stage">שלב: {collab.stage}</span>}
              </figure>
            )}

            <div className="pg-panel__head">
              <div className="pg-panel__title">
                <h1>{collab.title}</h1>
                {(collab.by || collab.byRole) && (
                  <div className="pg-panel__by">
                    {/* Who published it is for members too: a visitor gets a blurred placeholder, never the name. */}
                    פורסם על ידי {locked ? <HiddenName /> : <>{collab.by && <b>{collab.by}</b>}{collab.by && collab.byRole && " · "}{collab.byRole}</>}
                  </div>
                )}
              </div>
            </div>

            {META.length > 0 && (
              <div className="co-meta-grid">
                {META.map((m) => (
                  <div key={m.label} className="co-mi">
                    <div className="co-mi__label">{m.label}</div>
                    <div className="co-mi__val">{m.val}</div>
                  </div>
                ))}
              </div>
            )}

            {locked ? <MembersLock session={session} next={`/collaboration/${collab.slug}`} /> : <>
            {collab.description.length > 0 && (
              <div className="pg-block">
                <h2>תיאור הפרויקט</h2>
                {collab.description.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            {collab.lookingList.length > 0 && (
              <div className="pg-block">
                <h2>מה מחפשים</h2>
                <ul className="pg-bullets">{collab.lookingList.map((l) => <li key={l}>{l}</li>)}</ul>
              </div>
            )}

            {collab.tags.length > 0 && (
              <div className="pg-block">
                <h2>תגיות</h2>
                <div className="pg-tags">{collab.tags.map((t) => <span key={t} className="pg-tag">{t}</span>)}</div>
              </div>
            )}

            {(collab.email || collab.phone) && (
              <div className="pg-block">
                <h2>פרטי יצירת קשר</h2>
                <div className="pg-contact-lines">
                  {collab.by && <div><b>איש קשר:</b> {collab.by}</div>}
                  {collab.email && <div><b>אימייל:</b> <a href={`mailto:${collab.email}`}>{collab.email}</a></div>}
                  {collab.phone && <div><b>טלפון:</b> {collab.phone}</div>}
                </div>
                {collab.phone && (
                  <a
                    href={`https://wa.me/${waNumber(collab.phone)}?text=${encodeURIComponent(`היי${collab.by ? ` ${collab.by}` : ""}, ראיתי באתר הנדלניסטים את "${collab.title}" ואשמח לשמוע עוד.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v6-btn v6-btn--primary v6-btn--lg"
                    data-magnetic=""
                    style={{ marginTop: 20 }}
                  >
                    <WhatsappIcon />
                    <span>{collab.by ? `שליחת הודעה בוואטסאפ ל${collab.by}` : "שליחת הודעה בוואטסאפ"}</span>
                  </a>
                )}
              </div>
            )}

            </>}

            <div className="pg-divider" />
            <div className="pg-actions">
              <a href="/collaborations" className="v6-btn v6-btn--glass">חזרה ללוח שיתופי הפעולה</a>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
