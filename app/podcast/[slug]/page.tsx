"use client";

import { useParams } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import "../podcast.css";
import { getEpisode, EPISODES } from "../data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);

export default function EpisodePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const ep = slug ? getEpisode(slug) : undefined;

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

  const others = EPISODES.filter((e) => e.slug !== ep.slug).slice(0, 3);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="pc-hero" data-reveal>
            <div className="pc-hero__cover">
              <img src={`https://images.unsplash.com/photo-${ep.img}?w=700&q=80`} alt="" />
              <button className="pc-hero__play" aria-label="נגן"><PlayIcon /></button>
            </div>
            <div>
              <div className="pc-hero__eyebrow">נדלפודקאסט · פרק {ep.num} · {ep.date}</div>
              <h1>{ep.title}</h1>
              <div className="pc-hero__guests">🎙️ {ep.guests} · {ep.duration}</div>
            </div>
          </div>

          {/* Player */}
          <div className="pc-player v6-glass" data-reveal>
            <button className="pc-player__btn" aria-label="נגן"><PlayIcon /></button>
            <span className="pc-player__time">15:24</span>
            <div className="pc-player__bar"><span /></div>
            <span className="pc-player__time">{ep.duration}</span>
          </div>

          {/* Body */}
          <div className="pc-body" data-reveal>
            <div className="pg-block">
              <h2>על הפרק</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink-2)", fontWeight: 300 }}>{ep.desc}</p>
            </div>
            <div className="pg-block">
              <h2>מה בפרק</h2>
              <div className="pc-notes">
                {ep.notes.map((n, i) => (
                  <div key={n} className="pc-note"><span className="pc-note__n">{i + 1}</span><span>{n}</span></div>
                ))}
              </div>
            </div>
            <div className="pg-divider" />
            <div className="pg-actions">
              <a href="#" className="v6-btn v6-btn--primary" data-magnetic=""><span>האזינו ב‑Spotify</span><ArrowIcon /></a>
              <a href="/podcast" className="v6-btn v6-btn--glass">לכל הפרקים</a>
            </div>
          </div>
        </div>
      </section>

      {/* More episodes */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="pg-subhead" data-reveal>עוד פרקים</h2>
          <div className="pg-grid">
            {others.map((e) => (
              <a key={e.slug} href={`/podcast/${e.slug}`} className="pg-imgcard v6-glass" data-reveal>
                <figure className="pg-imgcard__img"><img src={`https://images.unsplash.com/photo-${e.img}?w=700&q=80`} alt="" /></figure>
                <div className="pg-imgcard__body">
                  <div className="pg-imgcard__meta">פרק {e.num} · {e.duration}</div>
                  <h3>{e.title}</h3>
                  <span className="v6-btn v6-btn--glass" style={{ padding: "10px 18px", fontSize: 13.5 }}>לשמיעה</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
