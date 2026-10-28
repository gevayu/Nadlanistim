"use client";

import { useEffect, useState } from "react";
import { NADLANISTIM, type Nadlanist } from "./data";

// The signed-in member. The site has no login yet; /profile and /account are Avi Cohen too.
export const CURRENT_MEMBER = "avi-cohen";

// ponytail: edits from /my-account live in this browser's localStorage only - other visitors
// don't see them. Upgrade path: login + a members table/API, then read/write there instead.
const KEY = "nadlanistim.member";

export type MemberEdits = Partial<Omit<Nadlanist, "slug" | "img">>;

export function loadEdits(): MemberEdits | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

/** Throws if the browser refuses the write (private mode, storage full). */
export function saveEdits(edits: MemberEdits) {
  localStorage.setItem(KEY, JSON.stringify(edits));
}

const withEdits = (list: Nadlanist[], edits: MemberEdits | null) =>
  edits ? list.map((n) => (n.slug === CURRENT_MEMBER ? { ...n, ...edits } : n)) : list;

/** `base` with the current member's saved edits applied (after mount, so SSR stays stable). */
export function useNadlanistim(base: Nadlanist[] = NADLANISTIM): Nadlanist[] {
  const [list, setList] = useState(base);
  useEffect(() => setList(withEdits(base, loadEdits())), [base]);
  return list;
}
