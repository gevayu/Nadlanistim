import Image from "next/image";

export default function Footer() {
  return (
    <footer className="giant-footer">
      <Image
        src="/shape-3.png"
        alt=""
        width={1600}
        height={400}
        className="bg-shape-3"
        aria-hidden
      />
      <div className="footer-logo-huge">הנדל&quot;ניסטים</div>
      <div className="container footer-grid">
        <div className="footer-links">
          <Image
            src="/logo-nadlanistim-no-sides.png"
            alt="לוגו הנדלניסטים"
            width={280}
            height={70}
            style={{ height: 70, width: "auto", marginBottom: 24 }}
          />
          <p style={{ color: "var(--text-dim)", maxWidth: 250 }}>
            קהילת הנדל״ן האקסקלוסיבית של ישראל. מחברים בין הון, חזון וביצוע.
          </p>
        </div>
        <div className="footer-links">
          <h4>פלטפורמה</h4>
          <ul>
            <li><a href="#">מגזין ותוכן</a></li>
            <li><a href="#">לוח אירועים</a></li>
            <li><a href="#">זירת משרות</a></li>
            <li><a href="#">השקעות</a></li>
            <li><a href="#">הצטרפות לקהילה</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>קהילה</h4>
          <ul>
            <li><a href="#">חזון הנדלניסטים</a></li>
            <li><a href="#">הנבחרת</a></li>
            <li><a href="#">הקהילות</a></li>
            <li><a href="#">פסגת הנדל״ן 2026</a></li>
            <li><a href="#">נדלפודקאסט</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>רשתות</h4>
          <ul>
            <li>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.122 1.532 5.858L.057 23.428a.5.5 0 0 0 .61.61l5.57-1.475A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.072-1.387l-.363-.216-3.764.997.997-3.764-.216-.363A9.94 9.94 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
            </li>
            <li>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="container footer-bottom-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--border-dim)",
          marginTop: 40,
          paddingTop: 24,
          color: "var(--text-dim)",
          fontSize: "0.9rem",
        }}
      >
        <span>&copy; 2026 הנדל״ניסטים. כל הזכויות שמורות.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#">הצהרת נגישות</a>
          <a href="#">מדיניות פרטיות</a>
          <a href="#">תקנון אתר</a>
        </div>
      </div>
    </footer>
  );
}
