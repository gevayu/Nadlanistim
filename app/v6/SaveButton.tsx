"use client";

import { useEffect, useState } from "react";
import { useFavorite, type FavResult } from "./favorites";

export const HeartIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinejoin="round" />
  </svg>
);

const NOTES: Record<Exclude<FavResult, "login">, string> = {
  saved: "נשמר במועדפים",
  removed: "הוסר מהמועדפים",
  error: "השמירה לא הצליחה. נסו שוב.",
};

/** A short note under a heart for a few seconds after a click, with a way to the list once something is saved. */
export function useFavNote() {
  const [note, setNote] = useState<FavResult | "">("");
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 4000);
    return () => clearTimeout(t);
  }, [note]);
  const el = note && note !== "login" && (
    <span className="v6-fav__note" role="status">
      {NOTES[note]}
      {note === "saved" && <a href="/account#favorites">לאזור האישי</a>}
    </span>
  );
  return { setNote, el };
}

/**
 * "שמירה במועדפים" for one page: next to a page's title (inline), or as a heart on a card that links to it.
 * On a card the click stays on the heart and does not open the card's link.
 */
export default function SaveButton({ path, title, variant = "inline" }: { path?: string; title: string; variant?: "inline" | "card" }) {
  const [here, setHere] = useState("");
  useEffect(() => setHere(location.pathname + location.search), []);
  const target = path ?? here;
  const { on, toggle } = useFavorite(target);
  const { setNote, el } = useFavNote();
  const [busy, setBusy] = useState(false);
  if (!target) return null;

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    setNote(await toggle(title));
    setBusy(false);
  };

  if (variant === "card") {
    return (
      <span className="v6-save-card">
        <button type="button" className="v6-save-card__btn" aria-pressed={on} aria-label={`שמירה של ${title} במועדפים`} title={on ? "שמור במועדפים" : "שמירה במועדפים"} onClick={onClick}>
          <HeartIcon on={on} />
        </button>
        {el}
      </span>
    );
  }
  return (
    <span className="v6-save">
      <button type="button" className="v6-save__btn" aria-pressed={on} onClick={onClick}>
        <HeartIcon on={on} />
        <span>{on ? "שמור במועדפים" : "שמירה במועדפים"}</span>
      </button>
      {el}
    </span>
  );
}
