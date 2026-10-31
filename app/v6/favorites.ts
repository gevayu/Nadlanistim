"use client";

// The member's favorites in the browser: one fetch per page, shared by every heart on it (header, page, cards),
// so saving in one place lights up the others. Stored on the account through /api/favorites.
import { useEffect, useState } from "react";

type Fav = { path: string; title: string; at: string };

let items: Fav[] | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

const signedIn = () => /(?:^|;\s*)nad_signed_in=1(?:;|$)/.test(document.cookie);

/** One spelling per page: Hebrew slugs arrive percent-encoded from the address bar and plain from WordPress. */
export const favPath = (p: string) => {
  try {
    return decodeURI(p);
  } catch {
    return p;
  }
};

function load() {
  loading ??= fetch("/api/favorites", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then((d) => { items = Array.isArray(d.items) ? d.items : []; })
    .catch(() => { items = []; })
    .then(notify);
  return loading;
}

export type FavResult = "saved" | "removed" | "login" | "error";

export function useFavorite(rawPath: string) {
  const path = favPath(rawPath);
  const [, rerender] = useState(0);
  useEffect(() => {
    const f = () => rerender((n) => n + 1);
    listeners.add(f);
    if (signedIn()) load();
    return () => { listeners.delete(f); };
  }, []);

  const on = !!items?.some((f) => favPath(f.path) === path);

  const toggle = async (title: string): Promise<FavResult> => {
    if (!signedIn()) {
      location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
      return "login";
    }
    const next = !on;
    const before = items;
    items = next ? [{ path, title, at: new Date().toISOString() }, ...(items ?? [])] : (items ?? []).filter((f) => favPath(f.path) !== path);
    notify();
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, title, on: next }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      if (Array.isArray(d.items)) items = d.items;
      notify();
      return next ? "saved" : "removed";
    } catch {
      items = before;
      notify();
      return "error";
    }
  };

  return { on, toggle };
}
