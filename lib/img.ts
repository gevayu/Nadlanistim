// Pictures from WordPress and from public/ go through Vercel's image service (/_next/image): it resizes them to the
// width asked for, converts them to WebP and serves them from the same CDN as the pages. Without it a phone got the
// WordPress original (up to 2400px, 815KB) from the server in Tel Aviv.
// The widths are Next's defaults (images.deviceSizes + imageSizes in next.config.mjs); the service refuses any other.

const WIDTHS = [64, 96, 128, 256, 384, 640, 828, 1080, 1200, 1920];
const WP_UPLOADS = "https://nadlanistim-cms.bold-move.co.il/wp-content/uploads/";

/** Only raster pictures we host: SVG and GIF stay as they are, and so does any other site's picture. */
const resizable = (src: string) =>
  (src.startsWith(WP_UPLOADS) || (src.startsWith("/") && !src.startsWith("//"))) && /\.(jpe?g|png|webp)$/i.test(src);

/** The address of `src` at the smallest width that covers `w` pixels. */
export function sized<T extends string | undefined>(src: T, w: number): T {
  if (!src || !resizable(src)) return src;
  const width = WIDTHS.find((x) => x >= w) ?? WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` as T;
}

/** A srcset of `src` at the given widths, for a picture whose size the browser picks with `sizes`. */
export function srcSetOf(src: string | undefined, widths = [256, 384, 640, 828, 1080, 1200, 1920]): string | undefined {
  if (!src || !resizable(src)) return undefined;
  return widths.map((w) => `${sized(src, w)} ${w}w`).join(", ");
}

/** `sizes` of a photo grid: two columns on a phone, three of at most about 420px above that. */
export const GALLERY_SIZES = "(max-width: 760px) 43vw, (max-width: 1300px) 32vw, 420px";

/**
 * Article HTML from WordPress, with its pictures going through the service. WordPress's own srcset points at the
 * originals, so it is replaced as well. Pictures from other sites stay as they are.
 */
export function sizedHtml(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\ssrc="([^"]+)"/i.exec(tag)?.[1];
    const set = src && srcSetOf(src);
    if (!set) return tag;
    const attr = (v: string) => v.replace(/&/g, "&amp;");
    return tag
      .replace(/\s(srcset|sizes)="[^"]*"/gi, "")
      .replace(/\ssrc="[^"]+"/i, ` src="${attr(sized(src, 1080))}" srcset="${attr(set)}" sizes="(max-width: 960px) 100vw, 960px"`);
  });
}
