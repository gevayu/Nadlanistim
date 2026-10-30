import type { Metadata } from "next";
import SiteShell from "./v6/SiteShell";

export const metadata: Metadata = { title: "הדף לא נמצא" };

// Any unknown address, or a WordPress item that was removed, lands here in the site's own design.
export default function NotFound() {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>הדף הזה לא נמצא</h1>
            <p>ייתכן שהקישור ישן או שהתוכן הוסר.</p>
          </div>
          <p>
            <a href="/" className="v6-btn v6-btn--primary v6-btn--lg">לעמוד הבית</a>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
