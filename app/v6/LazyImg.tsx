"use client";

import { useEffect, useRef, useState } from "react";

// Pictures below the first screen wait until the page has finished loading (hero image, fonts, scripts), then
// each one loads as it comes within 600px of the screen. Native loading="lazy" alone starts up to 2500px ahead on
// a slow connection, so on a phone the cards shared the first seconds with the hero.
// Only for pictures in a box of fixed size: a picture that sets its own height would push the page when it arrives.

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

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & { src?: string };

export default function LazyImg({ src, alt = "", ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let live = true;
    const stops: (() => void)[] = [];
    afterLoad().then(() => {
      const img = ref.current;
      if (!live || !img) return;
      const track = scroller(img);
      // Near the screen first (the carousel itself, when there is one), then near the carousel's visible part.
      stops.push(
        whenNear(track ?? img, null, "600px", () => {
          if (!track) return setShow(true);
          stops.push(whenNear(img, track, "0px 600px", () => setShow(true)));
        }),
      );
    });
    return () => {
      live = false;
      stops.forEach((stop) => stop());
    };
  }, []);
  return (
    <>
      <img ref={ref} {...rest} alt={alt} src={show ? src : undefined} decoding="async" />
      {/* Search engines and visitors without JavaScript get the picture as is. */}
      <noscript>
        <img {...rest} alt={alt} src={src} />
      </noscript>
    </>
  );
}
