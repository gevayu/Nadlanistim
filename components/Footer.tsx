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
            width={220}
            height={55}
            style={{ height: 55, width: "auto", marginBottom: 24 }}
          />
          <p style={{ color: "var(--text-dim)", maxWidth: 250 }}>
            קהילת הנדל״ן האקסקלוסיבית של ישראל. מחברים בין הון, חזון וביצוע.
          </p>
        </div>
        <div className="footer-links">
          <h4>פלטפורמה</h4>
          <ul>
            <li>
              <a href="#">מגזין ותוכן</a>
            </li>
            <li>
              <a href="#">לוח אירועים</a>
            </li>
            <li>
              <a href="#">זירת משרות</a>
            </li>
            <li>
              <a href="#">הצטרפות לקהילה</a>
            </li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>משפטי</h4>
          <ul>
            <li>
              <a href="#">תקנון האתר</a>
            </li>
            <li>
              <a href="#">מדיניות פרטיות</a>
            </li>
            <li>
              <a href="#">הצהרת נגישות</a>
            </li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>רשתות</h4>
          <ul>
            <li>
              <a href="#">LinkedIn</a>
            </li>
            <li>
              <a href="#">WhatsApp</a>
            </li>
            <li>
              <a href="#">Facebook</a>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="container"
        style={{
          textAlign: "center",
          borderTop: "1px solid var(--border-dim)",
          marginTop: 40,
          paddingTop: 24,
          color: "var(--text-dim)",
          fontSize: "0.9rem",
        }}
      >
        &copy; 2026 הנדל״ניסטים. כל הזכויות שמורות.
      </div>
    </footer>
  );
}
