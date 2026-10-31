import type { Metadata } from "next";

// Per-route <title>, meta description and Open Graph. The root layout adds " | הנדלניסטים" to `title`
// through its template; Open Graph has no template, so the full title is spelled out here.

export const SITE_NAME = "הנדלניסטים";
export const SITE_URL = "https://nadlanistim.yuvalgeva.com";

// url "./" is the page's own address (Next resolves it against metadataBase and the route).
export const OG_BASE = { siteName: SITE_NAME, locale: "he_IL", type: "website", url: "./" } as const;

/** One line of plain text, cut on a word boundary to fit a search snippet. */
export function clip(text: string, max = 155): string {
  const s = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : max).replace(/[\s,.:;-]+$/, "") + "...";
}

export function pageMeta(title: string, description: string, image?: string): Metadata {
  const desc = clip(description);
  // Only real image URLs: local events store an Unsplash id, uploaded avatars can be data URLs.
  const images = image && /^https?:\/\//.test(image) ? [image] : undefined;
  return {
    title,
    description: desc,
    openGraph: { ...OG_BASE, title: `${title} | ${SITE_NAME}`, description: desc, ...(images && { images }) },
  };
}

/**
 * For a layout whose route has child segments (/podcast, /youth): a plain-string title would drop the
 * root " | הנדלניסטים" template for the children, so the template is restated here.
 */
export function sectionMeta(title: string, description: string): Metadata {
  return { ...pageMeta(title, description), title: { default: title, template: `%s | ${SITE_NAME}` } };
}
