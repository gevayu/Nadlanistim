import { guard } from "@/lib/paywall";
import SiteShell from "../../v6/SiteShell";
import "../youth.css";
import "../../collaborations/collaborations.css";
import { roleLine } from "../data";
import { getYouth } from "../wp";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MailIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>);

export default async function YouthMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  await guard("youthPage", "/youth"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const slug = decodeURIComponent((await params).slug);
  const members = await getYouth();
  const m = members.find((x) => x.slug === slug);

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

  const others = members.filter((x) => x.slug !== m.slug).slice(0, 4);

  return (
    <SiteShell crumb={m.name}>
      <section className="v6-section">
        <div className="v6-container">
          <a href="/youth" className="yt-back" data-reveal>→ נבחרת הנדלניסטים הצעירים</a>

          <article className="pg-panel v6-glass" data-reveal>
            <div className="pg-profile2__hero">
              {m.photo && (
                <div className="pg-profile2__img">
                  <img src={m.photo} alt={m.name} />
                </div>
              )}
              <div className="pg-profile2__text">
                <span className="yt-badge" style={{ marginBottom: 16 }}>● חבר/ת נבחרת</span>
                <h1>{m.name}</h1>
                {roleLine(m) && <div className="pg-profile2__role">{roleLine(m)}</div>}
                {m.oneLiner && <p className="pg-profile2__intro">{m.oneLiner}</p>}
                {m.focus.length > 0 && (
                  <div className="yt-tags">
                    {m.focus.map((f) => <span key={f} className="pg-tag">{f}</span>)}
                  </div>
                )}
              </div>
            </div>

            {m.bio.length > 0 && (
              <div className="pg-block">
                <h2>הסיפור</h2>
                {m.bio.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            {m.quote && <blockquote className="pg-quote2">״{m.quote}״</blockquote>}

            {/* WordPress has only an email for youth members; no LinkedIn / Instagram fields. */}
            {m.email && (
              <div className="pg-social-wrap" style={{ marginTop: 32 }}>
                <div className="pg-social-head">צרו קשר</div>
                <div className="pg-social">
                  <a href={`mailto:${m.email}`} aria-label="אימייל"><MailIcon /></a>
                </div>
              </div>
            )}

            <div className="pg-divider" />
            <div className="pg-actions" style={{ justifyContent: "center" }}>
              <a href="/youth" className="v6-btn v6-btn--glass">חזרה לנבחרת</a>
            </div>
          </article>
        </div>
      </section>

      {/* Other team members */}
      {others.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="yt-section-title" data-reveal>עוד מהנבחרת</h2>
            <div className="yt-members">
              {others.map((o) => (
                <a key={o.slug} href={`/youth/${o.slug}`} className="yt-member v6-glass" data-reveal>
                  {o.photo && <div className="yt-member__av"><img src={o.photo} alt={o.name} /></div>}
                  <div className="yt-member__info">
                    <div className="yt-member__name">{o.name}</div>
                    {roleLine(o) && <div className="yt-member__role">{roleLine(o)}</div>}
                    {o.oneLiner && <p className="yt-member__line">{o.oneLiner}</p>}
                    <span className="yt-member__more">לפרופיל המלא <ArrowIcon /></span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
