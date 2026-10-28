"use client";

import { useEffect, useState } from "react";

const LinkedinIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 18h-2.6v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9.8V9.7h2.5v1.1h0c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18z" /></svg>);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>);
const LinkIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" strokeLinecap="round" strokeLinejoin="round" /></svg>);

/** Share links for the current page. The absolute URL is only known in the browser, so the links appear after mount. */
export default function ShareButtons() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  if (!url) return null;
  const u = encodeURIComponent(url);
  return (
    <div className="post-share__btns">
      <a href={`https://wa.me/?text=${u}`} target="_blank" rel="noopener" aria-label="שיתוף בוואטסאפ"><WhatsappIcon /></a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener" aria-label="שיתוף בלינקדאין"><LinkedinIcon /></a>
      <a href={url} aria-label="העתק קישור" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(url); }}><LinkIcon /></a>
    </div>
  );
}
