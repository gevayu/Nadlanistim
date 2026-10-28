import SiteShell from "../v6/SiteShell";

export default function CheckoutNotFound() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head">
            <h1>המוצר לא נמצא</h1>
            <p>ייתכן שהקישור שגוי או שהמוצר כבר לא נמכר.</p>
          </div>
          <div className="pg-cta-row">
            <a href="/" className="v6-btn v6-btn--glass"><span>לדף הבית</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
