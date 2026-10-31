const FOOTER_COLS: { h: string; links: [string, string][] }[] = [
  { h: "קהילה", links: [["/#about", "אודות"], ["/#members", "חברי הקהילה"]] },
  { h: "אירועים", links: [["/#events", "קרובים"], ["/#featured", "הכנס השנתי"], ["/events", "ארכיון אירועים"]] },
  { h: "תוכן", links: [["/#articles", "כתבות"], ["/post-archive", "מרכז הידע"], ["/#podcast", "פודקאסט"]] },
  { h: "צרו קשר", links: [["/contact", "צרו קשר"], ["/join", "הצטרפות"]] },
];

// Legal pages, each a WordPress page rendered by app/(legal).
const LEGAL_LINKS: [string, string][] = [["/terms", "תנאי שימוש"], ["/privacy", "פרטיות"], ["/accessibility", "הצהרת נגישות"]];

export default function SiteFooter() {
  return (
    <footer className="v6-footer">
      <div className="v6-container">
        <div className="v6-footer__top">
          <div className="v6-footer__brand">
            <div className="v6-footer__logo">
              <img loading="lazy" src="/v6-assets/logo-360.png" width={360} height={114} alt="הנדלניסטים" />
            </div>
            <p>הקהילה המקצועית של ענף הנדל״ן בישראל.<br />קשרים. אירועים. הזדמנויות.</p>
          </div>
          <div className="v6-footer__cols">
            {FOOTER_COLS.map((c) => (
              <div key={c.h}>
                <h2>{c.h}</h2>
                {c.links.map(([href, label]) => (
                  <a key={label} href={href}>{label}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="v6-footer__bottom">
          <span>© 2026 הנדלניסטים. כל הזכויות שמורות.</span>
          <span className="v6-footer__legal">
            {LEGAL_LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
