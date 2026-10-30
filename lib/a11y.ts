// Accessibility widget settings (components/A11yWidget.tsx). Kept in the visitor's browser only.

export const A11Y_KEY = "nad-a11y";

export type A11ySettings = {
  text?: number; // 0 to 3 steps of page zoom
  contrast?: boolean;
  grayscale?: boolean;
  invert?: boolean;
  links?: boolean;
  headings?: boolean;
  font?: boolean;
  spacing?: boolean;
  motion?: boolean; // stop animations
  cursor?: boolean;
  focus?: boolean;
};

export const A11Y_ZOOM = [1, 1.1, 1.2, 1.35];

/**
 * Puts the settings on <html>: classes for the CSS switches, a zoom variable and the colour filters.
 * Self-contained on purpose: the root layout inlines its source (applyA11y.toString()) so saved settings
 * are on the page before the first paint.
 */
export function applyA11y(s: A11ySettings) {
  var root = document.documentElement;
  var flags = ["links", "headings", "font", "spacing", "motion", "cursor", "focus", "invert"] as const;
  for (var i = 0; i < flags.length; i++) root.classList.toggle("a11y-" + flags[i], !!s[flags[i]]);
  var zoom = [1, 1.1, 1.2, 1.35][s.text || 0] || 1;
  root.style.setProperty("--a11y-zoom", String(zoom));
  var filter = (s.contrast ? "contrast(1.5) " : "") + (s.grayscale ? "grayscale(1) " : "") + (s.invert ? "invert(1) hue-rotate(180deg)" : "");
  root.style.filter = filter.trim();
}

export function readA11y(): A11ySettings {
  try {
    return JSON.parse(localStorage.getItem(A11Y_KEY) || "{}") || {};
  } catch {
    return {};
  }
}
