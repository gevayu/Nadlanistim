"use client";

import { useEffect, useMemo, useState } from "react";
import SiteShell from "../v6/SiteShell";
import { type Nadlanist } from "./data";
import OpenToWorkRing from "../v6/OpenToWorkRing";
import SaveButton from "../v6/SaveButton";
import LazyImg from "../v6/LazyImg";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Filters = { q: string; field: string; place: string };
const NONE: Filters = { q: "", field: "", place: "" };

/** The values the members actually have: fields by how many hold them, places alphabetically. */
const choices = (people: Nadlanist[], key: "field" | "place") => {
  const count = new Map<string, number>();
  people.forEach((p) => p[key] && count.set(p[key], (count.get(p[key]) ?? 0) + 1));
  const list = [...count.keys()];
  return key === "field" ? list.sort((a, b) => count.get(b)! - count.get(a)!) : list.sort((a, b) => a.localeCompare(b, "he"));
};

/**
 * The directory. Filters live in the address (?field=תיווך&place=חיפה&q=...), so the homepage's field
 * cards can link straight to a filtered view and a filtered view can be shared.
 */
export default function Directory({ people }: { people: Nadlanist[] }) {
  const [f, setF] = useState<Filters>(NONE);
  const fields = useMemo(() => choices(people, "field"), [people]);
  const places = useMemo(() => choices(people, "place"), [people]);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    setF({ q: u.get("q") ?? "", field: u.get("field") ?? "", place: u.get("place") ?? "" });
  }, []);

  const update = (next: Filters) => {
    setF(next);
    const u = new URLSearchParams();
    (Object.keys(next) as (keyof Filters)[]).forEach((k) => next[k] && u.set(k, next[k]));
    window.history.replaceState(null, "", u.size ? `?${u}` : window.location.pathname);
  };

  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return people.filter(
      (p) =>
        (!f.field || p.field === f.field) &&
        (!f.place || p.place === f.place) &&
        (!q || [p.name, p.role, p.quote, p.field, p.place].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [people, f]);
  const filtered = !!(f.q || f.field || f.place);

  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הכר את הנדלניסטים שלנו - <em>סיפורים של אנשים אמיתיים</em></h1>
            <p>הקהילה שלנו בנויה מאנשים עם סיפורים ייחודיים, חלומות, והישגים. כל נדלניסט מביא איתו ניסיון, ערכים ורצון לתרום ולהיתרום. בואו להכיר את הפנים מאחורי הקהילה.</p>
          </div>

          <div className="pg-toolbar" data-reveal role="search">
            <input
              className="pg-search"
              type="search"
              placeholder="חיפוש חופשי…"
              aria-label="חיפוש חופשי"
              value={f.q}
              onChange={(e) => update({ ...f, q: e.target.value })}
            />
            <select className="pg-select" aria-label="תחום עיסוק" value={f.field} onChange={(e) => update({ ...f, field: e.target.value })}>
              <option value="">כל התחומים</option>
              {fields.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="pg-select" aria-label="מיקום" value={f.place} onChange={(e) => update({ ...f, place: e.target.value })}>
              <option value="">כל המיקומים</option>
              {places.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <p className="pg-count" aria-live="polite">
            {filtered ? `${shown.length} מתוך ${people.length} נדלניסטים` : `${people.length} נדלניסטים`}
            {filtered && <button type="button" className="pg-count__reset" onClick={() => update(NONE)}>ניקוי הסינון</button>}
          </p>

          {shown.length === 0 && <p className="pg-empty">לא נמצאו נדלניסטים שמתאימים לחיפוש.</p>}

          {/* No data-reveal on the cards: the reveal runs once on load, so a card that comes back after a filter change would stay hidden. */}
          <div className="pg-grid">
            {shown.map((p) => (
              <a key={p.slug} href={`/nadlanist/${p.slug}`} className="pg-person v6-glass">
                <SaveButton variant="card" path={`/nadlanist/${p.slug}`} title={p.name} />
                <div className="pg-person__av">
                  <LazyImg src={p.photo} alt={p.openToWork ? `${p.name} · פתוח/ה להצעות עבודה` : p.name} />
                  {p.openToWork && <OpenToWorkRing />}
                </div>
                <div className="pg-person__name">{p.name}</div>
                <div className="pg-person__role">{p.role}</div>
                {p.quote && <p className="pg-person__q">״{p.quote}״</p>}
                <span className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>קרא עוד</span>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/nadlanist-new" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>שתף את הסיפור שלך - הצטרף למדריך</span><ArrowIcon /></a>
            <a href="/join" className="v6-btn v6-btn--glass v6-btn--lg">רוצה להיות חלק מהסיפור? הצטרף לקהילה</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
