"use client";

import { useContext, useEffect, useState } from "react";
import type { SponsorSlot, SponsorSlotName, SponsorSlots } from "./sponsors";
import "./sponsor-strip.css";
import { SponsorSlotsContext } from "./SponsorSlotsContext";

// One request per page load, shared by every strip on the page.
let slotsRequest: Promise<SponsorSlots | null> | null = null;
const loadSlots = () =>
  (slotsRequest ??= fetch("/api/sponsor-slots")
    .then((r) => (r.ok ? (r.json() as Promise<SponsorSlots>) : null))
    .catch(() => null));

/**
 * A sponsor strip from WordPress ("הגדרות אתר" → "חסויות"). "top" sits under the breadcrumbs on every
 * inner page (SiteShell, home, post-archive); "events" is the lower strip on home, /events,
 * /collaborations and /post-archive.
 * The slots come with the page (root layout); only when that read failed does the strip fetch them after load.
 * Nothing renders when the slot is off or empty.
 */
export default function SponsorStrip({ slot = "top" }: { slot?: SponsorSlotName }) {
  const served = useContext(SponsorSlotsContext);
  const [fetched, setFetched] = useState<SponsorSlot | null>(null);
  useEffect(() => {
    if (served) return;
    let live = true;
    loadSlots().then((s) => live && setFetched(s?.[slot] ?? null));
    return () => {
      live = false;
    };
  }, [served, slot]);

  const sponsor = served ? served[slot] : fetched;

  if (!sponsor) return null;
  const body = sponsor.banner ? (
    <>
      <span className="sp-strip__label">בחסות</span>
      <picture className="sp-strip__banner">
        <source media="(max-width: 760px)" srcSet={sponsor.banner.mobile} />
        <img loading="lazy" src={sponsor.banner.desktop} alt={sponsor.name} />
      </picture>
    </>
  ) : (
    <>
      <span className="sp-strip__label">בחסות</span>
      {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} className="sp-strip__logo" /> : <b className="sp-strip__name">{sponsor.name}</b>}
      {sponsor.text && <span className="sp-strip__text">{sponsor.text}</span>}
    </>
  );
  return (
    <section className="v6-section">
      <div className="v6-container">
        {sponsor.url ? (
          <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored" className={`v6-sponsorstrip v6-glass sp-strip${sponsor.banner ? " sp-strip--banner" : ""}`}>{body}</a>
        ) : (
          <div className={`v6-sponsorstrip v6-glass sp-strip${sponsor.banner ? " sp-strip--banner" : ""}`}>{body}</div>
        )}
      </div>
    </section>
  );
}
