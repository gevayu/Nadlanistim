"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Takes one page off the favorites list in /account, then redraws the list. */
export default function FavRemove({ path, title }: { path: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    const r = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, title, on: false }),
    }).catch(() => null);
    if (r?.ok) router.refresh();
    else setBusy(false);
  };
  return (
    <button type="button" className="ac-fav-x" aria-label={`הסרת "${title}" מהמועדפים`} title="הסרה מהמועדפים" disabled={busy} onClick={remove}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}
