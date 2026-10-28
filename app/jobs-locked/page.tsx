"use client";

import SiteShell from "../v6/SiteShell";
import "../collaborations/collaborations.css";
import { JOBS } from "../jobs/data";

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

export default function JobsLockedPage() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>לוח דרושים <em>לחברי הקהילה</em></h1>
            <p>ההזדמנויות המלאות שמורות לחברי הנדלניסטים. הצטרפו כדי לחשוף את כל הפרטים — מפרסם, סוג המשרה, מיקום ותיאור מלא.</p>
          </div>

          <div className="pg-grid">
            {JOBS.map((j) => (
              <article key={j.id} className="lk-card v6-glass" data-reveal>
                {/* Visible: title + publish date */}
                <div className="lk-card__head">
                  <h3 className="lk-card__title">{j.title}</h3>
                  <span className="lk-card__date">פורסם {j.date}</span>
                </div>

                {/* Locked body: blurred details + capsule overlay */}
                <div className="lk-locked">
                  <div className="lk-blur" aria-hidden="true">
                    <div className="pg-card__by">מפרסם: <b>{j.by}</b></div>
                    <div className="pg-card__rows">
                      <div><b>סוג עבודה:</b>{j.type}</div>
                      <div><b>מיקום:</b>{j.place}</div>
                    </div>
                    <p className="pg-card__desc">{j.desc}</p>
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
              <span>הצטרפו לקהילה וחשפו את כל המשרות</span>
              <ArrowIcon />
            </a>
            <a href="/jobs" className="v6-btn v6-btn--glass v6-btn--lg">כבר חברים? ללוח המלא</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
