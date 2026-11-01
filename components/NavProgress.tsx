"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// A tap on a link to another page shows a thin bar at the top until the new page is on screen.
// Without it a phone shows nothing while the page is on its way, and the site looks stuck.
export default function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const timer = useRef(0);

  useEffect(() => {
    // Capture phase: next/link cancels the click before a bubbling listener would see it.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      clearTimeout(timer.current);
      // A prefetched page opens at once; the bar only shows when the wait is noticeable.
      timer.current = window.setTimeout(() => setState("run"), 150);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    setState((s) => (s === "run" ? "done" : "idle"));
  }, [pathname]);

  useEffect(() => {
    if (state === "idle") return;
    // "done" fades out; a navigation that never lands (an error, the back button) doesn't leave the bar on.
    const t = setTimeout(() => setState("idle"), state === "done" ? 300 : 15000);
    return () => clearTimeout(t);
  }, [state]);

  return state === "idle" ? null : <div aria-hidden className={`nav-progress nav-progress--${state}`} />;
}
