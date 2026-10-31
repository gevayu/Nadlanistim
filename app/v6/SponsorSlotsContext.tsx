"use client";

import { createContext } from "react";
import type { SponsorSlots } from "./sponsors";

/**
 * The sponsor slots, read once on the server by the root layout. With them in the first HTML the top
 * strip no longer appears after load and pushes the page down (CLS 0.26 on every inner page).
 * null: the server read failed, so SponsorStrip falls back to /api/sponsor-slots.
 */
export const SponsorSlotsContext = createContext<SponsorSlots | null>(null);

export function SponsorSlotsProvider({ slots, children }: { slots: SponsorSlots | null; children: React.ReactNode }) {
  return <SponsorSlotsContext.Provider value={slots}>{children}</SponsorSlotsContext.Provider>;
}
