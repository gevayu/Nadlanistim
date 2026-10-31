"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFavorite } from "./favorites";
import { HeartIcon, useFavNote } from "./SaveButton";

// Nothing to save on the home page or on the member's own screens.
const SKIP = /^\/(?:$|account|profile|login|register|forgot-password|join|checkout|thank-you)(?:\/|$)/;

/** The page's own name, without the " | הנדלניסטים" every title ends with. */
const pageTitle = () =>
  document.title.replace(/\s*\|\s*הנדלניסטים\s*$/, "").trim() || document.querySelector("h1")?.textContent?.trim() || location.pathname;

/** The header heart: saves the current page (with its ?e= when the page is chosen by one) to the member's favorites. */
export default function FavButton() {
  const pathname = usePathname();
  const [here, setHere] = useState(pathname);
  useEffect(() => setHere(location.pathname + location.search), [pathname]);
  const { on, toggle } = useFavorite(here);
  const { setNote, el } = useFavNote();
  const [busy, setBusy] = useState(false);

  if (SKIP.test(pathname)) return null;

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setNote(await toggle(pageTitle()));
    setBusy(false);
  };

  return (
    <span className="v6-fav">
      <button type="button" className="v6-fav__btn" aria-pressed={on} aria-label="שמירה במועדפים" title={on ? "שמור במועדפים" : "שמירה במועדפים"} aria-busy={busy} onClick={onClick}>
        <HeartIcon on={on} />
      </button>
      {el}
    </span>
  );
}
