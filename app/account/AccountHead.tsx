import type { Session } from "../../lib/auth";
import { logout } from "../login/actions";
import OpenToWorkRing from "../v6/OpenToWorkRing";

/** "30.11.2026" from the ISO date the auth API sends. */
const day = (iso: string) => new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Jerusalem" }).format(new Date(iso)).replaceAll("/", ".");

/** The signed-in member's greeting: name and photo from their nadlanist profile, membership state from WooCommerce. */
export default function AccountHead({ session }: { session: Session }) {
  const own = session.nadlanist;
  const name = own?.name || session.name;
  const status = !session.verified
    ? <>שלחנו קישור לאימות אל <bdi>{session.email}</bdi>. החברות והפרופיל נפתחים אחרי האישור.</>
    : session.member && session.memberUntil
      ? `החברות בתוקף עד ${day(session.memberUntil)}`
      : session.memberUntil
        ? `החברות הסתיימה ב-${day(session.memberUntil)}`
        : "אין חברות פעילה על האימייל הזה";

  return (
    <div className="ac-head v6-glass" data-reveal>
      <div className="ac-head__av">
        {own?.photo && <img src={own.photo} alt="" />}
        {own?.openToWork && <OpenToWorkRing />}
      </div>
      <div>
        <div className="ac-head__name">שלום, {name} 👋</div>
        {own?.role && <div className="ac-head__meta">{own.role}</div>}
        <div className="ac-head__meta">{status}</div>
      </div>
      {session.member
        ? <span className="ac-head__badge">MEMBERS ONLY ✓</span>
        : <a href="/join" className="ac-head__badge">להצטרפות לחברות</a>}
      <a href="/my-account" className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>
        {own ? "עריכת הפרופיל שלי" : "יצירת פרופיל במדריך"}
      </a>
      <form action={logout}>
        <button type="submit" className="ac-logout">התנתקות</button>
      </form>
    </div>
  );
}
