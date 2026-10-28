"use client";

import { useParams } from "next/navigation";
import SiteShell from "../../v6/SiteShell";
import "../../communities/communities.css";
import { getCommunity, communityLogo, communityWhatsapp } from "../../communities/data";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WhatsappIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4l-2.6-1.3a.8.8 0 0 0-.9.1l-1.2 1.2c-1.9-.9-3.4-2.4-4.3-4.3l1.2-1.2a.8.8 0 0 0 .1-.9L8.5 5.4a.8.8 0 0 0-.9-.4l-2.3.6a.8.8 0 0 0-.6.8c0 5.9 4.8 10.7 10.7 10.7a.8.8 0 0 0 .8-.6l.6-2.3a.8.8 0 0 0-.4-.9z" /></svg>);

const IMG = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export default function CommunitySinglePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const c = slug ? getCommunity(slug) : undefined;

  if (!c) {
    return (
      <SiteShell>
        <section className="v6-section">
          <div className="v6-container">
            <div className="pg-head" data-reveal>
              <h1>תת הקהילה <em>לא נמצאה</em></h1>
              <p>ייתכן שהקישור שגוי.</p>
            </div>
            <div className="pg-cta-row">
              <a href="/communities" className="v6-btn v6-btn--primary v6-btn--lg"><span>לכל הקהילות</span><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      {/* Logo, name, subtitle, join */}
      <section className="v6-section">
        <div className="v6-container">
          <header className="cs1-head" data-reveal>
            <div className="cs1-head__logo"><img src={communityLogo(c)} alt={`הלוגו של ${c.name}`} /></div>
            <h1>{c.name}</h1>
            <p className="cs1-head__sub">{c.tagline}</p>
            <a href={communityWhatsapp(c)} target="_blank" rel="noopener noreferrer" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic="">
              <WhatsappIcon />
              <span>הצטרפות לקבוצת הוואטסאפ</span>
            </a>
          </header>
        </div>
      </section>

      {/* About */}
      <section className="v6-section">
        <div className="v6-container">
          <div className="cs-about" data-reveal>
            <h2 className="cs-title">על הקהילה</h2>
            {c.about.map((p, i) => <p key={i} className="cs-lead">{p}</p>)}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="v6-section">
        <div className="v6-container">
          <h2 className="cs-title cs-title--center" data-reveal>מחיי הקהילה</h2>
          <div className="cs-gallery">
            {c.gallery.map((g, i) => (
              <figure key={g + i} className="cs-shot" data-reveal>
                <img src={IMG(g, 800)} alt={`${c.name} - תמונה ${i + 1}`} />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
