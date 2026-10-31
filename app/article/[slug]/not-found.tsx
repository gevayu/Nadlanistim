import SiteShell from "../../v6/SiteShell";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ArticleNotFound() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal><h1>המאמר <em>לא נמצא</em></h1><p>ייתכן שהקישור שגוי.</p></div>
          <div className="pg-cta-row"><a href="/post-archive" className="v6-btn v6-btn--primary v6-btn--lg"><span>חזרה למרכז הידע</span><ArrowIcon /></a></div>
        </div>
      </section>
    </SiteShell>
  );
}
