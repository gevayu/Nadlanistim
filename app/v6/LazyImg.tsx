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

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & { src?: string };

export default function LazyImg({ src, alt = "", ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let live = true;
    let io: IntersectionObserver | undefined;
    afterLoad().then(() => {
      if (!live || !ref.current) return;
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setShow(true);
            io?.disconnect();
          }
        },
        { rootMargin: "600px" },
      );
      io.observe(ref.current);
    });
    return () => {
      live = false;
      io?.disconnect();
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
