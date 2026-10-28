"use client";

import { useRef, useState } from "react";
import SiteShell from "../../v6/SiteShell";
import "../podcast.css";
import type { Episode } from "../data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);
const PauseIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>);

// Joins the non-empty parts of a meta line.
const dot = (...parts: (string | false)[]) => parts.filter(Boolean).join(" · ");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ponytail: play/pause and progress only; no seeking. Upgrade: make .pc-player__bar a keyboard-operable slider.
export default function EpisodeView({ ep, others }: { ep?: Episode; others: Episode[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [len, setLen] = useState(0);
  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };
  const PlayPause = playing ? PauseIcon : PlayIcon;
  const playLabel = playing ? "השהה" : "נגן";

  if (!ep) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal><h1>הפרק <em>לא נמצא</em></h1><p>ייתכן שהקישור שגוי.</p></div>
            <div className="pg-cta-row"><a href="/podcast" className="v6-btn v6-btn--primary v6-btn--lg"><span>לכל הפרקים</span><ArrowIcon /></a></div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell crumb={ep.title}>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="pc-hero" data-reveal>
            {ep.img && (
              <div className="pc-hero__cover">
                <img src={ep.img} alt="" />
                {ep.audio && <button className="pc-hero__play" aria-label={playLabel} onClick={toggle}><PlayPause /></button>}
              </div>
            )}
            <div>
              <div className="pc-hero__eyebrow">{dot("נדלפודקאסט", !!ep.num && `פרק ${ep.num}`, ep.date)}</div>
              <h1>{ep.title}</h1>
              {(ep.guests || ep.duration) && <div className="pc-hero__guests">{dot(!!ep.guests && `🎙️ ${ep.guests}`, ep.duration)}</div>}
            </div>
          </div>

          {/* Player: only when the episode has an MP3 */}
          {ep.audio && (
            <div className="pc-player v6-glass" data-reveal>
              <audio
                ref={audio}
                src={ep.audio}
                preload="metadata"
                onLoadedMetadata={(e) => setLen(e.currentTarget.duration)}
                onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              <button className="pc-player__btn" aria-label={playLabel} onClick={toggle}><PlayPause /></button>
              <span className="pc-player__time">{clock(pos)}</span>
              <div className="pc-player__bar"><span style={{ width: `${len ? (pos / len) * 100 : 0}%` }} /></div>
              <span className="pc-player__time">{ep.duration || clock(len)}</span>
            </div>
          )}

          {/* Body */}
          <div className="pc-body" data-reveal>
            {ep.desc && (
              <div className="pg-block">
                <h2>על הפרק</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink-2)", fontWeight: 300 }}>{ep.desc}</p>
              </div>
            )}
            {ep.notes.length > 0 && (
              <div className="pg-block">
                <h2>מה בפרק</h2>
                <div className="pc-notes">
                  {ep.notes.map((n, i) => (
                    <div key={n} className="pc-note"><span className="pc-note__n">{i + 1}</span><span>{n}</span></div>
                  ))}
                </div>
              </div>
            )}
            {(ep.desc || ep.notes.length > 0) && <div className="pg-divider" />}
            <div className="pg-actions">
              {ep.listen && <a href={ep.listen} target="_blank" rel="noopener" className="v6-btn v6-btn--primary" data-magnetic=""><span>האזינו ב‑Spotify</span><ArrowIcon /></a>}
              <a href="/podcast" className="v6-btn v6-btn--glass">לכל הפרקים</a>
            </div>
          </div>
        </div>
      </section>

      {/* More episodes */}
      {others.length > 0 && (
        <section className="v6-section">
          <div className="v6-container">
            <h2 className="pg-subhead" data-reveal>עוד פרקים</h2>
            <div className="pg-grid">
              {others.map((e) => (
                <a key={e.slug} href={`/podcast/${e.slug}`} className="pg-imgcard v6-glass" data-reveal>
                  {e.img && <figure className="pg-imgcard__img"><img src={e.img} alt="" /></figure>}
                  <div className="pg-imgcard__body">
                    <div className="pg-imgcard__meta">{dot(!!e.num && `פרק ${e.num}`, e.duration)}</div>
                    <h3>{e.title}</h3>
                    <span className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>לשמיעה</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
