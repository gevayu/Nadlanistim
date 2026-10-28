import SiteShell from "../v6/SiteShell";

export default function ThankYouNotFound() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head">
            <h1>ההזמנה לא נמצאה</h1>
            <p>הקישור לא תקין.</p>
          </div>
          <div className="pg-cta-row">
            <a href="/" className="v6-btn v6-btn--glass"><span>לדף הבית</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
