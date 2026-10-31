import { guard } from "@/lib/paywall";
import SiteShell from "../v6/SiteShell";
import "./communities.css";
import { getCommunities } from "./wp";
import LazyImg from "../v6/LazyImg";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function CommunitiesPage() {
  await guard("communities", "/communities"); // "חומת תשלום" in WordPress; open to everyone unless set otherwise
  const communities = await getCommunities();
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הקהילות של <em>הנדלניסטים</em></h1>
            <p>קהילה אחת גדולה - ובתוכה עשר קהילות ממוקדות. בחרו את התחומים שלכם, הצטרפו לשיחות הרלוונטיות אליכם, ותמצאו את האנשים שמדברים בדיוק בשפה שלכם.</p>
          </div>

          <div className="cm-grid">
            {communities.map((c) => (
              <a key={c.slug} href={`/community/${c.slug}`} className="cm-card v6-glass" data-reveal>
                {c.logo && <div className="cm-card__logo"><LazyImg src={c.logo} alt="" /></div>}
                <h2>{c.name}</h2>
                <p>{c.tagline}</p>
                {c.members && <div className="cm-card__members">{c.members} חברים</div>}
                <span className="v6-btn v6-btn--glass" style={{ padding: "10px 20px", fontSize: 13.5 }}>לקהילה</span>
              </a>
            ))}
          </div>

          <div className="pg-cta-row" data-reveal>
            <a href="/#contact" className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>לא מצאתם קהילה? הציעו אחת חדשה</span><ArrowIcon /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
