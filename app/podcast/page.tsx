import { guard } from "@/lib/paywall";
import SiteShell from "../v6/SiteShell";
import "./podcast.css";
import { getEpisodes } from "./wp";
import LazyImg from "../v6/LazyImg";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);

export default async function PodcastArchivePage() {
  await guard("podcast", "/podcast"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const episodes = await getEpisodes();
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>נדל<em>פודקאסט</em></h1>
            <p>שיחות עומק עם האנשים שמזיזים את שוק הנדל״ן בישראל. פרק חדש כל שבועיים - האזינו, למדו, והישארו צעד לפני כולם.</p>
          </div>

          <div className="pc-grid">
            {episodes.map((e) => (
              <a key={e.slug} href={`/podcast/${e.slug}`} className="pc-card v6-glass" data-reveal>
                {e.img && (
                  <div className="pc-card__img">
                    <LazyImg src={e.img} alt="" />
                    <span className="pc-card__play"><PlayIcon /></span>
                  </div>
                )}
                <div className="pc-card__body">
                  <div className="pc-card__eyebrow">{[e.num && `פרק ${e.num}`, e.duration].filter(Boolean).join(" · ")}</div>
                  <div className="pc-card__title">{e.title}</div>
                  {e.guests && <div className="pc-card__guests">{e.guests}</div>}
                  <span className="pc-card__more">לשמיעה <ArrowIcon /></span>
                </div>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>הירשמו לעדכון על פרקים חדשים</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
