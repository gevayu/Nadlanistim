"use client";

import { useEffect } from "react";

export default function BentoMouseTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(
        ".bento-card"
      );
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return null;
}
