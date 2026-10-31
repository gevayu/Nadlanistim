"use client";

import SiteShell from "../v6/SiteShell";
import { sendContact } from "../forms/actions";
import { FormError, Honeypot, useFormSend } from "../forms/FormParts";
import { ROLE_OPTIONS } from "../forms/options";
import type { Contact } from "../v6/wp";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);

export default function ContactView({ contact }: { contact: Contact }) {
  const { state, pending, onSubmit } = useFormSend(sendContact);
  const sent = !!state.ok;
  // Each channel shows only when "הגדרות אתר" has it.
  const channels = [
    contact.whatsapp && { href: contact.whatsapp, label: "וואטסאפ" },
    contact.instagram && { href: contact.instagram, label: "אינסטגרם" },
    contact.tiktok && { href: contact.tiktok, label: "טיקטוק" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>בואו נדבר - <em>אנחנו כאן בשבילכם</em></h1>
            <p>יש לכם שאלה? רעיון? הצעה? או סתם רוצים להגיד שלום?</p>
            <p>אנחנו באמת רוצים לשמוע מכם - כי הקהילה הזאת היא שלכם, ואנחנו כאן כדי לעשות אותה למקום הטוב ביותר בשבילכם.</p>
            <p><strong style={{ color: "var(--ink)" }}>כל פנייה חשובה לנו, ואנחנו מתחייבים לחזור אליכם תוך 24–48 שעות.</strong></p>
          </div>

          <div className="ct-grid">
            <div className="pg-panel v6-glass" data-reveal>
              {sent ? (
                <div className="pg-sent">ההודעה נשלחה. ✓ נחזור אליך תוך 24–48 שעות.</div>
              ) : (
                <form className="pg-form" onSubmit={onSubmit}>
                  <Honeypot />
                  <div className="v6-field">
                    <label htmlFor="c-name">שם מלא</label>
                    <input id="c-name" name="name" type="text" required autoComplete="name" placeholder="ישראלה ישראלי" />
                  </div>
                  <div className="pg-formgrid">
                    <div className="v6-field">
                      <label htmlFor="c-phone">טלפון</label>
                      <input id="c-phone" name="phone" type="tel" autoComplete="tel" placeholder="050-0000000" />
                    </div>
                    <div className="v6-field">
                      <label htmlFor="c-email">אימייל</label>
                      <input id="c-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div className="v6-field">
                    <label htmlFor="c-field">תחום עיסוק</label>
                    <select id="c-field" name="field" defaultValue="">
                      <option value="">בחרו תחום…</option>
                      {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="v6-field">
                    <label htmlFor="c-msg">הודעה</label>
                    <textarea id="c-msg" name="message" required rows={6} placeholder="כתבו לנו כל מה שתרצו…" />
                  </div>
                  <p className="pg-privacy-note">נשתמש בפרטים רק כדי לענות לפנייה. לא חייבים למסור טלפון. פרטים נוספים ב<a href="/privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a>.</p>
                  <FormError error={state.error} />
                  <button type="submit" className="v6-btn v6-btn--primary v6-btn--lg v6-btn--block" disabled={pending} data-magnetic="">
                    <span>{pending ? "שולחים…" : "שלח הודעה"}</span>
                    <ArrowIcon />
                  </button>
                </form>
              )}
            </div>

            {(contact.email || channels.length > 0) && (
              <aside className="pg-panel v6-glass ct-info" data-reveal aria-label="פרטי יצירת קשר">
                <h2>פרטי יצירת קשר</h2>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="ct-info__mail">
                    <MailIcon />
                    <span>
                      <small>אימייל</small>
                      <bdi>{contact.email}</bdi>
                    </span>
                  </a>
                )}
                {channels.length > 0 && (
                  <div className="ct-info__channels">
                    {channels.map((c) => (
                      <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="v6-btn v6-btn--glass">{c.label}</a>
                    ))}
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
