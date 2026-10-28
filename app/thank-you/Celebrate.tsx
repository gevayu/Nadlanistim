"use client";

import { useEffect, useRef } from "react";
import { celebrate } from "../v6/confetti";

/** Fires the confetti once per page view (the ref survives React's dev double-run of effects). */
export default function Celebrate() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    celebrate();
  }, []);
  return null;
}
