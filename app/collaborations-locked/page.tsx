import SiteShell from "../v6/SiteShell";
import "../collaborations/collaborations.css";
import { onBoard } from "../collaborations/data";
import { getCollabs } from "../collaborations/wp";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
  </svg>
);

export default async function CollaborationsLockedPage() {
  const collabs = (await getCollabs()).filter(onBoard);
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>עסקאות <em>לחברי הקהילה</em></h1>
            <p>העסקאות המלאות שמורות לחברי הנדלניסטים. הצטרפו כדי לחשוף את כל הפרטים - שותפים, מיקום, היקף השקעה ויצירת קשר.</p>
          </div>

          <div className="pg-grid">
            {collabs.map((c) => (
              <article key={c.slug} className="lk-card v6-glass" data-reveal>
                {/* Visible: title + publish date */}
                <div className="lk-card__head">
                  <h3 className="lk-card__title">{c.title}</h3>
                  <span className="lk-card__date">פורסם {c.date}</span>
                </div>

                {/* Locked body: blurred details + capsule overlay */}
                <div className="lk-locked">
                  <div className="lk-blur" aria-hidden="true">
                    {c.looking && <div className="pg-card__by">מחפש: <b>{c.looking}</b></div>}
                    {(c.place || c.invest) && (
                      <div className="pg-card__rows">
                        {c.place && <div><b>מיקום:</b>{c.place}</div>}
                        {c.invest && <div><b>השקעה נדרשת:</b>{c.invest}</div>}
                      </div>
                    )}
                    {c.stage && <span className="pg-stage">שלב: {c.stage}</span>}
                    {c.by && (
                      <div className="pg-card__foot">
                        <span className="pg-card__date">פורסם ע״י {c.by}</span>
                      </div>
                    )}
                  </div>

                  <a href="/join" className="lk-capsule">
                    <LockIcon />
                    <span>Members Only</span>
                    <b>להצטרפות</b>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/join" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <span>הצטרפו לקהילה וחשפו את כל העסקאות</span>
              <ArrowIcon />
            </a>
            <a href="/collaborations" className="v6-btn v6-btn--glass v6-btn--lg">כבר חברים? לעסקאות המלאות</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
