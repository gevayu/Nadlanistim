"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Nothing to save on the home page or on the member's own screens.
const SKIP = /^\/(?:$|account|profile|login|register|forgot-password|join|checkout|thank-you)(?:\/|$)/;

const HeartIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinejoin="round" />
  </svg>
);

/** The page's own name, without the " | הנדלניסטים" every title ends with. */
const pageTitle = () =>
  document.title.replace(/\s*\|\s*הנדלניסטים\s*$/, "").trim() || document.querySelector("h1")?.textContent?.trim() || location.pathname;

/** Saves the current page to the member's favorites (shown in /account). Logged out, it leads to the login. */
export default function FavButton() {
  const path = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const skip = SKIP.test(path);

  useEffect(() => {
    const yes = /(?:^|;\s*)nad_signed_in=1(?:;|$)/.test(document.cookie);
    setSignedIn(yes);
    if (!yes || skip) return;
    fetch("/api/favorites", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOn(Boolean(d?.items?.some((f: { path: string }) => f.path === path))))
      .catch(() => {});
  }, [path, skip]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 4000);
    return () => clearTimeout(t);
  }, [note]);

  if (skip) return null;

  const toggle = async () => {
    if (!signedIn) {
      location.href = `/login?next=${encodeURIComponent(path)}`;
      return;
    }
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, title: pageTitle(), on: next }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setNote(next ? "נשמר במועדפים" : "הוסר מהמועדפים");
    } catch {
      setOn(!next);
      setNote("השמירה לא הצליחה. נסו שוב.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="v6-fav">
      <button type="button" className="v6-fav__btn" aria-pressed={on} aria-label="שמירה במועדפים" title={on ? "שמור במועדפים" : "שמירה במועדפים"} aria-busy={busy} onClick={busy ? undefined : toggle}>
        <HeartIcon on={on} />
      </button>
      <span className="v6-fav__note" role="status">
        {note}
        {note === "נשמר במועדפים" && <a href="/account#favorites">לאזור האישי</a>}
      </span>
    </span>
  );
}
