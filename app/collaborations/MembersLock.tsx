import type { Session } from "../../lib/auth";

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
  </svg>
);

// Line widths for the blurred stand-in text. The real details never reach a non-member's browser.
const BARS = [94, 82, 88, 61, 90, 73, 85, 48];

/**
 * The members-only part of a single page (/collaboration/<slug>, /nadlanist/<slug>), locked:
 * blurred placeholder lines, the "Members Only" capsule to /join, and a line that fits the visitor.
 */
export default function MembersLock({ session, next }: { session: Session | null; next: string }) {
  return (
    <div className="lk-single">
      <div className="lk-locked">
        <div className="lk-blur" aria-hidden="true">
          {BARS.map((w, i) => <span key={i} className="lk-bar" style={{ width: `${w}%` }} />)}
        </div>
        <a href="/join" className="lk-capsule">
          <LockIcon />
          <span>Members Only</span>
          <b>להצטרפות</b>
        </a>
      </div>
      <p className="lk-login">
        {!session ? (
          <>כבר חברים? <a href={`/login?next=${encodeURIComponent(next)}`}>להתחברות</a></>
        ) : !session.verified ? (
          <>שלחנו קישור לאימות אל <bdi>{session.email}</bdi>. אחרי האישור הפרטים ייפתחו.</>
        ) : (
          <>לחשבון שלכם אין חברות פעילה. החברות נבדקת לפי האימייל שאיתו שילמתם.</>
        )}
      </p>
    </div>
  );
}
