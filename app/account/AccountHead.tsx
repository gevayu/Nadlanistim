"use client";

import { CURRENT_MEMBER, type Nadlanist } from "../nadlanistim/data";
import { useNadlanistim } from "../nadlanistim/member";
import OpenToWorkRing from "../v6/OpenToWorkRing";

/** The member's greeting, with their /my-account edits (kept in this browser) applied. */
export default function AccountHead({ people }: { people: Nadlanist[] }) {
  const me = useNadlanistim(people).find((n) => n.slug === CURRENT_MEMBER);
  return (
    <div className="ac-head v6-glass" data-reveal>
      <div className="ac-head__av">
        {me?.photo && <img src={me.photo} alt="" />}
        {me?.openToWork && <OpenToWorkRing />}
      </div>
      <div>
        <div className="ac-head__name">שלום, {me?.name} 👋</div>
        {me?.role && <div className="ac-head__meta">{me.role}</div>}
      </div>
      <span className="ac-head__badge">MEMBERS ONLY ✓</span>
      <a href="/my-account" className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>עריכת הפרופיל שלי</a>
    </div>
  );
}
