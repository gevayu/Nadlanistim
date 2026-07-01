const FOOTER_COLS: { h: string; links: [string, string][] }[] = [
  { h: "קהילה", links: [["/#about", "אודות"], ["/#members", "חברי הקהילה"], ["/#stories", "סיפורי הצלחה"]] },
  { h: "אירועים", links: [["/#events", "קרובים"], ["/#featured", "הכנס השנתי"], ["#", "ארכיון אירועים"]] },
  { h: "תוכן", links: [["/#articles", "כתבות"], ["/post-archive", "בית הידע"], ["/#podcast", "פודקאסט"]] },
  { h: "צרו קשר", links: [["/#contact", "הצטרפות"], ["mailto:hello@nadlanistim.co.il", "אימייל"], ["#", "וואטסאפ"]] },
];

export default function SiteFooter() {
  return (
    <footer className="v6-footer">
      <div className="v6-container">
        <div className="v6-footer__top">
          <div className="v6-footer__brand">
            <div className="v6-footer__logo">
              <img src="/v6-assets/logo.png" alt="הנדלניסטים" />
            </div>
            <p>הקהילה המקצועית של ענף הנדל״ן בישראל.<br />קשרים. אירועים. הזדמנויות.</p>
          </div>
          <div className="v6-footer__cols">
            {FOOTER_COLS.map((c) => (
              <div key={c.h}>
                <h5>{c.h}</h5>
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
            <a href="#">תנאי שימוש</a>
            <a href="#">פרטיות</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
