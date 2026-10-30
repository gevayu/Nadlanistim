import SiteShell from "../v6/SiteShell";
import "./auth.css";

/** The frame shared by /login, /register and /forgot-password. */
export default function AuthPage({ title, accent, intro, children }: { title: string; accent: string; intro: string; children: React.ReactNode }) {
  return (
    <SiteShell>
      <section className="v6-section">
        <div className="v6-container">
          <div className="pg-head" data-reveal>
            <h1>{title} <em>{accent}</em></h1>
            <p>{intro}</p>
          </div>
          <article className="pg-panel v6-glass au-panel" data-reveal>{children}</article>
        </div>
      </section>
    </SiteShell>
  );
}
