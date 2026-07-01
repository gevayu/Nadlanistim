"use client";

import { useState } from "react";
import SiteShell from "../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>בואו נדבר — <em>אנחנו כאן בשבילכם</em></h1>
            <p>יש לכם שאלה? רעיון? הצעה? או סתם רוצים להגיד שלום?</p>
            <p>אנחנו באמת רוצים לשמוע מכם — כי הקהילה הזאת היא שלכם, ואנחנו כאן כדי לעשות אותה למקום הטוב ביותר בשבילכם.</p>
            <p><strong style={{ color: "var(--ink)" }}>כל פנייה חשובה לנו, ואנחנו מתחייבים לחזור אליכם תוך 24–48 שעות.</strong></p>
          </div>

          <div className="pg-panel v6-glass" style={{ maxWidth: 640 }} data-reveal>
            {sent ? (
              <div className="pg-sent">ההודעה נשלחה. ✓ נחזור אליך תוך 24–48 שעות.</div>
            ) : (
              <form className="pg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="v6-field">
                  <label htmlFor="c-name">שם מלא</label>
                  <input id="c-name" type="text" required placeholder="ישראלה ישראלי" />
                </div>
                <div className="v6-field">
                  <label htmlFor="c-email">כתובת אימייל</label>
                  <input id="c-email" type="email" required placeholder="you@email.com" />
                </div>
                <div className="v6-field">
                  <label htmlFor="c-msg">הודעה</label>
                  <textarea id="c-msg" required placeholder="כתבו לנו כל מה שתרצו…" />
                </div>
                <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" data-magnetic="">
                  <span>שלח הודעה</span>
                  <ArrowIcon />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
