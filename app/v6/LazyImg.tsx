"use client";

import { useEffect, useRef, useState } from "react";
import { sized } from "@/lib/img";

// Pictures below the first screen wait until the page has finished loading (hero image, fonts, scripts), then
// each one loads as it comes within 600px of the screen. Native loading="lazy" alone starts up to 2500px ahead on
// a slow connection, so on a phone the cards shared the first seconds with the hero.
// Only for pictures in a box of fixed size: a picture that sets its own height would push the page when it arrives.
// The box also gives the width to ask for (lib/img.ts), so a 94px avatar no longer downloads a 400px original.
// `priority` is for the one picture that is the largest thing on the first screen: it starts with the HTML instead.

let pageLoaded: Promise<void> | null = null;
const afterLoad = () =>
  (pageLoaded ??= new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else addEventListener("load", () => resolve(), { once: true });
  }));

/** True once the page has finished loading. For CSS background pictures, which never wait on their own. */
export function usePageLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    afterLoad().then(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, []);
  return loaded;
}

/**
 * The carousel or side-scrolling list the picture sits in, if any: the nearest ancestor that clips content wider
 * than itself. A margin on the screen does not reach past that clip, so slides there are watched against it instead.
 */
function scroller(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (getComputedStyle(p).overflowX !== "visible" && p.scrollWidth > p.clientWidth + 1) return p;
  }
  return null;
}

/** Calls `onNear` once `el` comes within `margin` of `root` (the screen when null). Returns the disconnect. */
function whenNear(el: Element, root: Element | null, margin: string, onNear: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        onNear();
      }
    },
    { root, rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & { src?: string; priority?: boolean };

/** Device pixels the picture's box needs: its width (or its parent's, while the picture is still empty) at up to 2x. */
const need = (img: HTMLImageElement) =>
  Math.ceil((img.getBoundingClientRect().width || img.parentElement?.clientWidth || 414) * Math.min(devicePixelRatio || 1, 2));

export default function LazyImg({ src, alt = "", priority, ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (priority || !src) return;
    let live = true;
    const stops: (() => void)[] = [];
    const show = () => ref.current && setUrl(sized(src, need(ref.current)));
    afterLoad().then(() => {
      const img = ref.current;
      if (!live || !img) return;
      const track = scroller(img);
      // Near the screen first (the carousel itself, when there is one), then near the carousel's visible part.
      stops.push(
        whenNear(track ?? img, null, "600px", () => {
          if (!track) return show();
          stops.push(whenNear(img, track, "0px 600px", show));
        }),
      );
    });
    return () => {
      live = false;
      stops.forEach((stop) => stop());
    };
  }, [src, priority]);
  if (priority && src) {
    // Rendered on the server, so the size can't be measured: a phone-width card at 2x covers phones and desktop columns.
    return <img {...rest} alt={alt} src={sized(src, 828)} fetchPriority="high" decoding="async" />;
  }
  return (
    <>
      <img ref={ref} {...rest} alt={alt} src={url} decoding="async" />
      {/* Search engines and visitors without JavaScript get the picture as is. */}
      <noscript>
        <img {...rest} alt={alt} src={src} />
      </noscript>
    </>
  );
}
