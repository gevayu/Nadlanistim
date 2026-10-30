"use client";

import { useEffect, useRef, useState } from "react";
import {
  AArrowDown, AArrowUp, Accessibility, AlignJustify, CirclePause, Contrast, Droplets, Focus, Heading, Link,
  MousePointer2, RotateCcw, SunMoon, Type, X,
} from "lucide-react";
import { A11Y_KEY, A11Y_ZOOM, applyA11y, readA11y, type A11ySettings } from "@/lib/a11y";
import "./a11y-widget.css";

type Toggle = Exclude<keyof A11ySettings, "text">;

const TOGGLES: { key: Toggle; label: string; Icon: typeof Contrast }[] = [
  { key: "contrast", label: "ניגודיות גבוהה", Icon: Contrast },
  { key: "invert", label: "ניגודיות הפוכה", Icon: SunMoon },
  { key: "grayscale", label: "גווני אפור", Icon: Droplets },
  { key: "links", label: "הדגשת קישורים", Icon: Link },
  { key: "headings", label: "הדגשת כותרות", Icon: Heading },
  { key: "font", label: "גופן קריא", Icon: Type },
  { key: "spacing", label: "ריווח טקסט", Icon: AlignJustify },
  { key: "motion", label: "עצירת אנימציות", Icon: CirclePause },
  { key: "cursor", label: "סמן גדול", Icon: MousePointer2 },
  { key: "focus", label: "הדגשת מיקוד", Icon: Focus },
];

/** Accessibility menu: a small button at the bottom left that opens the display settings. */
export default function A11yWidget() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<A11ySettings>({});
  const fab = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setS(readA11y()), []);

  const update = (next: A11ySettings) => {
    setS(next);
    applyA11y(next);
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(next));
    } catch {
      // Private mode or blocked storage: the settings still apply until the page closes.
    }
  };

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        fab.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !fab.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const text = s.text ?? 0;
  const max = A11Y_ZOOM.length - 1;
  const active = Object.entries(s).some(([k, v]) => (k === "text" ? !!v : v === true));

  return (
    <div className="a11y" dir="rtl">
      <button
        ref={fab}
        type="button"
        className={`a11y__fab${active ? " is-active" : ""}`}
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <Accessibility aria-hidden />
      </button>

      {open && (
        <div ref={panel} id="a11y-panel" className="a11y__panel" role="dialog" aria-label="הגדרות נגישות">
          <div className="a11y__head">
            <h2>נגישות</h2>
            <button type="button" className="a11y__close" aria-label="סגירת תפריט הנגישות" onClick={() => { setOpen(false); fab.current?.focus(); }}>
              <X aria-hidden />
            </button>
          </div>

          <div className="a11y__size" role="group" aria-label="גודל טקסט">
            <span>גודל טקסט</span>
            <button type="button" aria-label="הקטנת טקסט" disabled={text === 0} onClick={() => update({ ...s, text: text - 1 })}>
              <AArrowDown aria-hidden />
            </button>
            <output aria-live="polite">{Math.round(A11Y_ZOOM[text] * 100)}%</output>
            <button type="button" aria-label="הגדלת טקסט" disabled={text === max} onClick={() => update({ ...s, text: text + 1 })}>
              <AArrowUp aria-hidden />
            </button>
          </div>

          <div className="a11y__grid">
            {TOGGLES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className="a11y__opt"
                aria-pressed={!!s[key]}
                onClick={() => update({ ...s, [key]: !s[key] })}
              >
                <Icon aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="a11y__foot">
            <button type="button" className="a11y__reset" onClick={() => update({})} disabled={!active}>
              <RotateCcw aria-hidden />
              <span>איפוס</span>
            </button>
            <a href="/accessibility">הצהרת נגישות</a>
          </div>
        </div>
      )}
    </div>
  );
}
